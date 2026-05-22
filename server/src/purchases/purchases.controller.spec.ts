import { Test, TestingModule } from '@nestjs/testing';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';

describe('PurchasesController pirkimų užklausos', () => {
  let controller: PurchasesController;

  const mockPurchasesService = {
    create: jest.fn(),
    handleStripeWebhook: jest.fn(),
    findMyPurchases: jest.fn(),
    download: jest.fn(),
    findMySales: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PurchasesController],
      providers: [
        {
          provide: PurchasesService,
          useValue: mockPurchasesService,
        },
      ],
    }).compile();

    controller = module.get<PurchasesController>(PurchasesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(controller).toBeDefined();
  });

  it('turi perduoti pirkimo sukūrimo užklausą servisui', () => {
    const body = { assetId: 'asset-1', licenseId: 'license-1' };
    const req = { user: { userId: 'user-1' } };
    const serviceResult = { checkoutUrl: 'https://stripe.test' };

    mockPurchasesService.create.mockReturnValue(serviceResult);

    const result = controller.create(body, req);

    expect(mockPurchasesService.create).toHaveBeenCalledWith(body, req.user);
    expect(result).toEqual(serviceResult);
  });

  it('turi perduoti webhook užklausą servisui', async () => {
    const signature = 'sig_test';
    const req = { rawBody: Buffer.from('test') };
    const serviceResult = { received: true };

    mockPurchasesService.handleStripeWebhook.mockResolvedValue(serviceResult);

    const result = await controller.handleWebhook(signature, req);

    expect(mockPurchasesService.handleStripeWebhook).toHaveBeenCalledWith(
      signature,
      req.rawBody,
    );
    expect(result).toEqual(serviceResult);
  });

  it('turi grąžinti vartotojo pirkimus', () => {
    const req = { user: { userId: 'user-1' } };
    const purchases = [{ id: 'purchase-1' }];

    mockPurchasesService.findMyPurchases.mockReturnValue(purchases);

    const result = controller.findMyPurchases(req);

    expect(mockPurchasesService.findMyPurchases).toHaveBeenCalledWith(req.user);
    expect(result).toEqual(purchases);
  });

  it('turi perduoti atsisiuntimo užklausą servisui', () => {
    const req = { user: { userId: 'user-1' } };
    const res = { download: jest.fn(), redirect: jest.fn() } as any;
    const purchaseId = 'purchase-1';

    controller.download(purchaseId, req, res);

    expect(mockPurchasesService.download).toHaveBeenCalledWith(
      purchaseId,
      req.user,
      res,
    );
  });

  it('turi grąžinti vartotojo pardavimus', () => {
    const req = { user: { userId: 'artist-1' } };
    const sales = [{ id: 'sale-1' }];

    mockPurchasesService.findMySales.mockReturnValue(sales);

    const result = controller.findMySales(req);

    expect(mockPurchasesService.findMySales).toHaveBeenCalledWith(req.user);
    expect(result).toEqual(sales);
  });
});