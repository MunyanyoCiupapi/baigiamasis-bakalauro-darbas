import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

const mockStripeSessionCreate = jest.fn();
const mockStripeConstructEvent = jest.fn();

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: mockStripeSessionCreate,
      },
    },
    webhooks: {
      constructEvent: mockStripeConstructEvent,
    },
  }));
});

describe('PurchasesService pirkimų logika', () => {
  let service: PurchasesService;

  const mockPrismaService = {
    asset: {
      findUnique: jest.fn(),
    },
    purchase: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_mock';
    process.env.STRIPE_WEBHOOK_SECRET = 'whsec_mock';
    process.env.FRONTEND_URL = 'http://localhost:3000';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PurchasesService>(PurchasesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(service).toBeDefined();
    expect(Stripe).toHaveBeenCalled();
  });

  it('turi grąžinti klaidą, kai trūksta assetId arba licenseId', async () => {
    await expect(
      service.create({}, { userId: 'user-1' }),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai kūrinys nerastas', async () => {
    mockPrismaService.asset.findUnique.mockResolvedValue(null);

    await expect(
      service.create(
        { assetId: 'asset-1', licenseId: 'license-1' },
        { userId: 'user-1' },
      ),
    ).rejects.toThrow(NotFoundException);
  });

  it('turi grąžinti klaidą, kai vartotojas bando pirkti savo kūrinį', async () => {
    mockPrismaService.asset.findUnique.mockResolvedValue({
      id: 'asset-1',
      title: 'Track 1',
      artistId: 'user-1',
      licenses: [],
    });

    await expect(
      service.create(
        { assetId: 'asset-1', licenseId: 'license-1' },
        { userId: 'user-1' },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai licencija nepriklauso kūriniui', async () => {
    mockPrismaService.asset.findUnique.mockResolvedValue({
      id: 'asset-1',
      title: 'Track 1',
      artistId: 'artist-1',
      licenses: [],
    });

    await expect(
      service.create(
        { assetId: 'asset-1', licenseId: 'license-1' },
        { userId: 'buyer-1' },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai licencija jau nupirkta', async () => {
    mockPrismaService.asset.findUnique.mockResolvedValue({
      id: 'asset-1',
      title: 'Track 1',
      artistId: 'artist-1',
      licenses: [
        {
          licenseId: 'license-1',
          priceCents: 1500,
          license: { name: 'Commercial' },
        },
      ],
    });

    mockPrismaService.purchase.findFirst.mockResolvedValue({
      id: 'purchase-1',
    });

    await expect(
      service.create(
        { assetId: 'asset-1', licenseId: 'license-1' },
        { userId: 'buyer-1' },
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi sėkmingai sukurti Stripe checkout sesiją', async () => {
    mockPrismaService.asset.findUnique.mockResolvedValue({
      id: 'asset-1',
      title: 'Track 1',
      artistId: 'artist-1',
      licenses: [
        {
          licenseId: 'license-1',
          priceCents: 1500,
          license: { name: 'Commercial' },
        },
      ],
    });

    mockPrismaService.purchase.findFirst.mockResolvedValue(null);
    mockStripeSessionCreate.mockResolvedValue({
      url: 'https://checkout.stripe.com/test-session',
    });

    const result = await service.create(
      { assetId: 'asset-1', licenseId: 'license-1' },
      { userId: 'buyer-1' },
    );

    expect(mockStripeSessionCreate).toHaveBeenCalled();
    expect(result).toEqual({
      message: 'Nukreipiama į apmokėjimą...',
      checkoutUrl: 'https://checkout.stripe.com/test-session',
    });
  });

  it('turi išsaugoti pirkimą po sėkmingo webhook', async () => {
    mockStripeConstructEvent.mockReturnValue({
      type: 'checkout.session.completed',
      data: {
        object: {
          metadata: {
            buyerId: 'buyer-1',
            assetId: 'asset-1',
            licenseId: 'license-1',
            priceCents: '1500',
          },
        },
      },
    });

    mockPrismaService.purchase.create.mockResolvedValue({
      id: 'purchase-1',
    });

    const result = await service.handleStripeWebhook(
      'signature',
      Buffer.from('raw-body'),
    );

    expect(mockPrismaService.purchase.create).toHaveBeenCalledWith({
      data: {
        buyerId: 'buyer-1',
        assetId: 'asset-1',
        licenseId: 'license-1',
        priceCents: 1500,
      },
    });

    expect(result).toEqual({ received: true });
  });

  it('turi grąžinti klaidą, kai webhook parašas neteisingas', async () => {
    mockStripeConstructEvent.mockImplementation(() => {
      throw new Error('Invalid signature');
    });

    await expect(
      service.handleStripeWebhook('bad-signature', Buffer.from('raw-body')),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti vartotojo pirkimus', async () => {
    const purchases = [{ id: 'purchase-1' }];
    mockPrismaService.purchase.findMany.mockResolvedValue(purchases);

    const result = await service.findMyPurchases({ userId: 'buyer-1' });

    expect(mockPrismaService.purchase.findMany).toHaveBeenCalledWith({
      where: {
        buyerId: 'buyer-1',
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

    expect(result).toEqual(purchases);
  });

  it('turi grąžinti vartotojo pardavimus', async () => {
    const sales = [{ id: 'sale-1' }];
    mockPrismaService.purchase.findMany.mockResolvedValue(sales);

    const result = await service.findMySales({ userId: 'artist-1' });

    expect(mockPrismaService.purchase.findMany).toHaveBeenCalledWith({
      where: {
        asset: {
          artistId: 'artist-1',
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

    expect(result).toEqual(sales);
  });

  it('turi grąžinti klaidą, kai pirkimas nerastas atsisiuntimo metu', async () => {
    mockPrismaService.purchase.findUnique.mockResolvedValue(null);

    const res = {
      redirect: jest.fn(),
      download: jest.fn(),
    } as any;

    await expect(
      service.download('purchase-1', { userId: 'buyer-1' }, res),
    ).rejects.toThrow(NotFoundException);
  });

  it('turi grąžinti klaidą, kai vartotojas neturi prieigos prie failo', async () => {
    mockPrismaService.purchase.findUnique.mockResolvedValue({
      id: 'purchase-1',
      buyerId: 'buyer-2',
      asset: {
        fileUrl: 'http://example.com/file.mp3',
      },
    });

    const res = {
      redirect: jest.fn(),
      download: jest.fn(),
    } as any;

    await expect(
      service.download('purchase-1', { userId: 'buyer-1' }, res),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi peradresuoti į failą, kai fileUrl yra nuotolinis', async () => {
    mockPrismaService.purchase.findUnique.mockResolvedValue({
      id: 'purchase-1',
      buyerId: 'buyer-1',
      asset: {
        fileUrl: 'http://example.com/file.mp3',
      },
    });

    const res = {
      redirect: jest.fn(),
      download: jest.fn(),
    } as any;

    await service.download('purchase-1', { userId: 'buyer-1' }, res);

    expect(res.redirect).toHaveBeenCalledWith('http://example.com/file.mp3');
  });
});