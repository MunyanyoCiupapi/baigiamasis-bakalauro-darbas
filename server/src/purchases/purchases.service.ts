import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';
import Stripe from 'stripe';

@Injectable()
export class PurchasesService {
  private stripe: Stripe;

  constructor(private readonly prisma: PrismaService) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
      apiVersion: '2026-03-25.dahlia',
    });
  }

  async create(body: any, currentUser: any) {
    const { assetId, licenseId } = body;

    if (!assetId || !licenseId) {
      throw new BadRequestException('Trūksta assetId arba licenseId');
    }

    const asset = await this.prisma.asset.findUnique({
      where: { id: assetId },
      include: {
        artist: true,
        licenses: {
          include: {
            license: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Kūrinys nerastas');
    }

    if (asset.artistId === currentUser.userId) {
      throw new BadRequestException('Negalite pirkti savo kūrinio');
    }

    const assetLicense = asset.licenses.find(
      (item) => item.licenseId === licenseId,
    );

    if (!assetLicense) {
      throw new BadRequestException('Ši licencija nepriklauso šiam kūriniui');
    }

    const existingPurchase = await this.prisma.purchase.findFirst({
      where: {
        buyerId: currentUser.userId,
        assetId,
        licenseId,
      },
    });

    if (existingPurchase) {
      throw new BadRequestException('Šią licenciją jau esate nusipirkę');
    }

    try {
      const session = await this.stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'eur',
              product_data: {
                name: `${asset.title} - ${assetLicense.license.name}`,
              },
              unit_amount: assetLicense.priceCents,
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/my-purchases?success=true`,
        cancel_url: `${process.env.FRONTEND_URL}/assets/${assetId}?canceled=true`,
        metadata: {
          buyerId: currentUser.userId,
          assetId: assetId,
          licenseId: licenseId,
          priceCents: assetLicense.priceCents.toString(),
        },
      });

      return {
        message: 'Nukreipiama į apmokėjimą...',
        checkoutUrl: session.url,
      };
    } catch (error: any) {
      throw new BadRequestException(`Stripe klaida: ${error.message}`);
    }
  }

  async handleStripeWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;

    try {
      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET || '',
      );
    } catch (err: any) {
      throw new BadRequestException(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const metadata = session.metadata;

      if (metadata) {
        try {
          await this.prisma.purchase.create({
            data: {
              buyerId: metadata.buyerId,
              assetId: metadata.assetId,
              licenseId: metadata.licenseId,
              priceCents: parseInt(metadata.priceCents, 10),
            },
          });
        } catch (dbError) {
          throw new BadRequestException('Klaida įrašant pirkimą į duomenų bazę');
        }
      }
    }

    return { received: true };
  }

  async findMyPurchases(currentUser: any) {
    return this.prisma.purchase.findMany({
      where: {
        buyerId: currentUser.userId,
      },
      include: {
        asset: {
          include: {
            artist: {
              select: {
                id: true,
                displayName: true,
                email: true,
                role: true,
              },
            },
          },
        },
        license: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async download(id: string, currentUser: any, res: Response) {
    const purchase = await this.prisma.purchase.findUnique({
      where: { id },
      include: {
        asset: true,
      },
    });

    if (!purchase) {
      throw new NotFoundException('Pirkimas nerastas');
    }

    if (purchase.buyerId !== currentUser.userId) {
      throw new BadRequestException('Neturite prieigos prie šio failo');
    }

    const relativeFilePath = purchase.asset.fileUrl.startsWith('/')
      ? purchase.asset.fileUrl.slice(1)
      : purchase.asset.fileUrl;

    const absoluteFilePath = path.join(process.cwd(), relativeFilePath);

    if (!fs.existsSync(absoluteFilePath)) {
      throw new NotFoundException('Failas nerastas serveryje');
    }

    return res.download(absoluteFilePath);
  }

  async findMySales(currentUser: any) {
    return this.prisma.purchase.findMany({
      where: {
        asset: {
          artistId: currentUser.userId,
        },
      },
      include: {
        asset: true,
        license: true,
        buyer: {
          select: {
            id: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc', 
      },
    });
  }
}