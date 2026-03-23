import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { Response } from 'express';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class AssetsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(body: any, currentUser: any, files: any) {
    const {
      title,
      description,
      type,
      genre,
      bpm,
      musicalKey,
      durationSec,
      prices,
    } = body;

    if (!title || !type) {
      throw new BadRequestException('Trūksta privalomų laukų');
    }

    const audioFile = files?.audio?.[0];
    const previewFile = files?.preview?.[0];
    const coverFile = files?.cover?.[0];

    if (!audioFile) {
      throw new BadRequestException('Audio failas yra privalomas');
    }

    if (!previewFile) {
      throw new BadRequestException('Preview failas yra privalomas');
    }

    if (!prices) {
      throw new BadRequestException('Reikia pateikti licencijų kainas');
    }

    let parsedPrices: { code: string; priceCents: number }[];

    try {
      parsedPrices = typeof prices === 'string' ? JSON.parse(prices) : prices;
    } catch {
      throw new BadRequestException('Neteisingas prices formatas');
    }

    if (!Array.isArray(parsedPrices) || parsedPrices.length === 0) {
      throw new BadRequestException('Licencijų kainos turi būti masyvas');
    }

    const licenses = await this.prisma.license.findMany();

    if (licenses.length === 0) {
      throw new BadRequestException('Sistemoje nėra licencijų');
    }

    const fileUrl = `/uploads/audio/${audioFile.filename}`;
    const previewUrl = `/uploads/previews/${previewFile.filename}`;
    const coverUrl = coverFile ? `/uploads/covers/${coverFile.filename}` : null;

    const asset = await this.prisma.asset.create({
      data: {
        title,
        description,
        type,
        genre,
        bpm: bpm ? Number(bpm) : null,
        musicalKey,
        durationSec: durationSec ? Number(durationSec) : null,
        fileUrl,
        previewUrl,
        coverUrl,
        artistId: currentUser.userId,
      },
    });

    for (const priceItem of parsedPrices) {
      const license = licenses.find((l) => l.code === priceItem.code);

      if (!license) {
        throw new BadRequestException(`Licencija ${priceItem.code} neegzistuoja`);
      }

      await this.prisma.assetLicense.create({
        data: {
          assetId: asset.id,
          licenseId: license.id,
          priceCents: Number(priceItem.priceCents),
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

  async preview(id: string, res: Response) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Asset nerastas');
    }

    if (!asset.previewUrl) {
      throw new NotFoundException('Preview failas nerastas');
    }

    const relativeFilePath = asset.previewUrl.startsWith('/')
      ? asset.previewUrl.slice(1)
      : asset.previewUrl;

    const absoluteFilePath = path.join(process.cwd(), relativeFilePath);

    if (!fs.existsSync(absoluteFilePath)) {
      throw new NotFoundException('Preview failas nerastas serveryje');
    }

    return res.sendFile(absoluteFilePath);
  }

  async remove(id: string, currentUser: any) {
    const asset = await this.prisma.asset.findUnique({
      where: { id },
    });

    if (!asset) {
      throw new NotFoundException('Asset nerastas');
    }

    if (asset.artistId !== currentUser.userId) {
      throw new BadRequestException('Negalite ištrinti ne savo kūrinio');
    }

    await this.prisma.asset.delete({
      where: { id },
    });

    return {
      message: 'Kūrinys sėkmingai ištrintas',
    };
  }
}