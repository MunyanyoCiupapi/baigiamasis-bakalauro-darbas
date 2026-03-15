import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: any, currentUser: any) {
    const {
      title,
      description,
      type,
      genre,
      bpm,
      musicalKey,
      durationSec,
      fileUrl,
      coverUrl,
      prices,
    } = body;

    if (!title || !type || !fileUrl) {
      throw new BadRequestException('Trūksta privalomų laukų');
    }

    if (!prices || !Array.isArray(prices) || prices.length === 0) {
      throw new BadRequestException('Reikia pateikti licencijų kainas');
    }

    const licenses = await this.prisma.license.findMany();

    if (licenses.length === 0) {
      throw new BadRequestException('Sistemoje nėra licencijų');
    }

    const asset = await this.prisma.asset.create({
      data: {
        title,
        description,
        type,
        genre,
        bpm,
        musicalKey,
        durationSec,
        fileUrl,
        coverUrl,
        artistId: currentUser.userId,
      },
    });

    for (const priceItem of prices) {
      const license = licenses.find((l) => l.code === priceItem.code);

      if (!license) {
        throw new BadRequestException(`Licencija ${priceItem.code} neegzistuoja`);
      }

      await this.prisma.assetLicense.create({
        data: {
          assetId: asset.id,
          licenseId: license.id,
          priceCents: priceItem.priceCents,
        },
      });
    }

    return this.findOne(asset.id);
  }

  async findAll() {
    return this.prisma.asset.findMany({
      include: {
        artist: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
          },
        },
        licenses: {
          include: {
            license: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
      include: {
        artist: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
          },
        },
        licenses: {
          include: {
            license: true,
          },
        },
      },
    });

    if (!asset) {
      throw new NotFoundException('Asset nerastas');
    }

    return asset;
  }
}