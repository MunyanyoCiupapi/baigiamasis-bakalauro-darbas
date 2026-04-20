import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { AssetsService } from './assets.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AssetsService kūrinių valdymo logika', () => {
  let service: AssetsService;

  const mockPrismaService = {
    license: {
      findMany: jest.fn(),
    },
    asset: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
    },
    assetLicense: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssetsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AssetsService>(AssetsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(service).toBeDefined();
  });

  it('turi grąžinti klaidą, kai trūksta privalomų laukų', async () => {
    await expect(
      service.create(
        {
          title: '',
          type: '',
        },
        { userId: 'artist-1' },
        {},
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai nėra audio failo', async () => {
    await expect(
      service.create(
        {
          title: 'Test Track',
          type: 'TRACK',
          prices: JSON.stringify([{ code: 'PERSONAL', priceCents: 1000 }]),
        },
        { userId: 'artist-1' },
        {
          preview: [{ buffer: Buffer.from('preview') }],
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai nėra preview failo', async () => {
    await expect(
      service.create(
        {
          title: 'Test Track',
          type: 'TRACK',
          prices: JSON.stringify([{ code: 'PERSONAL', priceCents: 1000 }]),
        },
        { userId: 'artist-1' },
        {
          audio: [{ buffer: Buffer.from('audio') }],
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai nepateiktos licencijų kainos', async () => {
    await expect(
      service.create(
        {
          title: 'Test Track',
          type: 'TRACK',
        },
        { userId: 'artist-1' },
        {
          audio: [{ buffer: Buffer.from('audio') }],
          preview: [{ buffer: Buffer.from('preview') }],
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai prices formatas neteisingas', async () => {
    await expect(
      service.create(
        {
          title: 'Test Track',
          type: 'TRACK',
          prices: '{neteisingas json}',
        },
        { userId: 'artist-1' },
        {
          audio: [{ buffer: Buffer.from('audio') }],
          preview: [{ buffer: Buffer.from('preview') }],
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai sistemoje nėra licencijų', async () => {
    mockPrismaService.license.findMany.mockResolvedValue([]);

    await expect(
      service.create(
        {
          title: 'Test Track',
          type: 'TRACK',
          prices: JSON.stringify([{ code: 'PERSONAL', priceCents: 1000 }]),
        },
        { userId: 'artist-1' },
        {
          audio: [{ buffer: Buffer.from('audio') }],
          preview: [{ buffer: Buffer.from('preview') }],
        },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi sėkmingai sukurti kūrinį', async () => {
    const body = {
      title: 'Test Track',
      description: 'Test description',
      type: 'TRACK',
      genre: 'Hip-Hop',
      bpm: '120',
      musicalKey: 'C Minor',
      durationSec: '180',
      prices: JSON.stringify([
        { code: 'PERSONAL', priceCents: 1000 },
        { code: 'COMMERCIAL', priceCents: 2500 },
      ]),
    };

    const currentUser = { userId: 'artist-1' };

    const files = {
      audio: [{ buffer: Buffer.from('audio') }],
      preview: [{ buffer: Buffer.from('preview') }],
      cover: [{ buffer: Buffer.from('cover') }],
    };

    const licenses = [
      { id: 'lic-1', code: 'PERSONAL' },
      { id: 'lic-2', code: 'COMMERCIAL' },
    ];

    const createdAsset = {
      id: 'asset-1',
      title: 'Test Track',
    };

    const finalAsset = {
      id: 'asset-1',
      title: 'Test Track',
      artist: {
        id: 'artist-1',
        displayName: 'Jonas',
      },
      licenses: [],
    };

    mockPrismaService.license.findMany.mockResolvedValue(licenses);

    jest
      .spyOn(service as any, 'uploadToCloudinary')
      .mockResolvedValueOnce('https://cloudinary.com/audio.mp3')
      .mockResolvedValueOnce('https://cloudinary.com/preview.mp3')
      .mockResolvedValueOnce('https://cloudinary.com/cover.jpg');

    mockPrismaService.asset.create.mockResolvedValue(createdAsset);
    mockPrismaService.assetLicense.create.mockResolvedValue({});
    jest.spyOn(service, 'findOne').mockResolvedValue(finalAsset as any);

    const result = await service.create(body, currentUser, files);

    expect(mockPrismaService.license.findMany).toHaveBeenCalled();
    expect(mockPrismaService.asset.create).toHaveBeenCalledWith({
      data: {
        title: body.title,
        description: body.description,
        type: body.type,
        genre: body.genre,
        bpm: 120,
        musicalKey: body.musicalKey,
        durationSec: 180,
        fileUrl: 'https://cloudinary.com/audio.mp3',
        previewUrl: 'https://cloudinary.com/preview.mp3',
        coverUrl: 'https://cloudinary.com/cover.jpg',
        artistId: currentUser.userId,
      },
    });

    expect(mockPrismaService.assetLicense.create).toHaveBeenCalledTimes(2);
    expect(result).toEqual(finalAsset);
  });

  it('turi grąžinti visus kūrinius', async () => {
    const assets = [{ id: 'asset-1', title: 'Track 1' }];
    mockPrismaService.asset.findMany.mockResolvedValue(assets);

    const result = await service.findAll();

    expect(mockPrismaService.asset.findMany).toHaveBeenCalledWith({
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

    expect(result).toEqual(assets);
  });

  it('turi grąžinti vartotojo įkeltus kūrinius', async () => {
    const uploads = [{ id: 'asset-1', title: 'Track 1' }];
    mockPrismaService.asset.findMany.mockResolvedValue(uploads);

    const result = await service.findMyUploads({ userId: 'artist-1' });

    expect(mockPrismaService.asset.findMany).toHaveBeenCalledWith({
      where: {
        artistId: 'artist-1',
      },
      include: {
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

    expect(result).toEqual(uploads);
  });

  it('turi grąžinti vieną kūrinį pagal id', async () => {
    const asset = {
      id: 'asset-1',
      title: 'Track 1',
    };

    mockPrismaService.asset.findUnique.mockResolvedValue(asset);

    const result = await service.findOne('asset-1');

    expect(mockPrismaService.asset.findUnique).toHaveBeenCalledWith({
      where: { id: 'asset-1' },
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

    expect(result).toEqual(asset);
  });

  it('turi grąžinti klaidą, kai kūrinys nerastas pagal id', async () => {
    mockPrismaService.asset.findUnique.mockResolvedValue(null);

    await expect(service.findOne('nerastas-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('turi peradresuoti į preview failą', async () => {
    const asset = {
      id: 'asset-1',
      previewUrl: 'https://cloudinary.com/preview.mp3',
    };

    const res = {
      redirect: jest.fn(),
    } as any;

    mockPrismaService.asset.findUnique.mockResolvedValue(asset);

    await service.preview('asset-1', res);

    expect(mockPrismaService.asset.findUnique).toHaveBeenCalledWith({
      where: { id: 'asset-1' },
    });
    expect(res.redirect).toHaveBeenCalledWith(asset.previewUrl);
  });

  it('turi grąžinti klaidą, kai preview failas nerastas', async () => {
    const asset = {
      id: 'asset-1',
      previewUrl: null,
    };

    const res = {
      redirect: jest.fn(),
    } as any;

    mockPrismaService.asset.findUnique.mockResolvedValue(asset);

    await expect(service.preview('asset-1', res)).rejects.toThrow(
      NotFoundException,
    );
  });

  it('turi ištrinti kūrinį, kai jis priklauso vartotojui', async () => {
    const asset = {
      id: 'asset-1',
      artistId: 'artist-1',
    };

    mockPrismaService.asset.findUnique.mockResolvedValue(asset);
    mockPrismaService.asset.delete.mockResolvedValue(asset);

    const result = await service.remove('asset-1', { userId: 'artist-1' });

    expect(mockPrismaService.asset.delete).toHaveBeenCalledWith({
      where: { id: 'asset-1' },
    });

    expect(result).toEqual({
      message: 'Kūrinys sėkmingai ištrintas',
    });
  });

  it('turi grąžinti klaidą, kai vartotojas bando ištrinti ne savo kūrinį', async () => {
    const asset = {
      id: 'asset-1',
      artistId: 'artist-2',
    };

    mockPrismaService.asset.findUnique.mockResolvedValue(asset);

    await expect(
      service.remove('asset-1', { userId: 'artist-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai šalinamas kūrinys nerastas', async () => {
    mockPrismaService.asset.findUnique.mockResolvedValue(null);

    await expect(
      service.remove('nerastas-id', { userId: 'artist-1' }),
    ).rejects.toThrow(NotFoundException);
  });
});