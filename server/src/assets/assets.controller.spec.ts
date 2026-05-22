import { Test, TestingModule } from '@nestjs/testing';
import { AssetsController } from './assets.controller';
import { AssetsService } from './assets.service';

describe('AssetsController kūrinių užklausos', () => {
  let controller: AssetsController;

  const mockAssetsService = {
    findAll: jest.fn(),
    findOne: jest.fn(),
    findMyUploads: jest.fn(),
    create: jest.fn(),
    remove: jest.fn(),
    preview: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssetsController],
      providers: [
        {
          provide: AssetsService,
          useValue: mockAssetsService,
        },
      ],
    }).compile();

    controller = module.get<AssetsController>(AssetsController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(controller).toBeDefined();
  });

  it('turi grąžinti visus kūrinius', async () => {
    const assets = [{ id: 'asset-1', title: 'Track 1' }];
    mockAssetsService.findAll.mockResolvedValue(assets);

    const result = await controller.findAll();

    expect(mockAssetsService.findAll).toHaveBeenCalled();
    expect(result).toEqual(assets);
  });

  it('turi grąžinti vieną kūrinį pagal id', async () => {
    const asset = { id: 'asset-1', title: 'Track 1' };
    mockAssetsService.findOne.mockResolvedValue(asset);

    const result = await controller.findOne('asset-1');

    expect(mockAssetsService.findOne).toHaveBeenCalledWith('asset-1');
    expect(result).toEqual(asset);
  });

  it('turi grąžinti vartotojo įkeltus kūrinius', async () => {
    const uploads = [{ id: 'asset-1', title: 'Track 1' }];
    const req = { user: { userId: 'artist-1' } };

    mockAssetsService.findMyUploads.mockResolvedValue(uploads);

    const result = await controller.findMyUploads(req);

    expect(mockAssetsService.findMyUploads).toHaveBeenCalledWith(req.user);
    expect(result).toEqual(uploads);
  });
});