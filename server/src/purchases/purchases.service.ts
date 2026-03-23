import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

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

    const purchase = await this.prisma.purchase.create({
      data: {
        buyerId: currentUser.userId,
        assetId,
        licenseId,
        priceCents: assetLicense.priceCents,
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
        buyer: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
          },
        },
      },
    });

    return {
      message: 'Pirkimas sėkmingas',
      purchase,
    };
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
}