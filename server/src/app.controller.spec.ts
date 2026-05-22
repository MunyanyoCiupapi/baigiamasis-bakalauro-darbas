import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';

describe('AppController pagrindinis funkcionalumas', () => {
  let controller: AppController;

  const mockAppService = {
    getHello: jest.fn().mockReturnValue('Hello World!'),
  };

  const mockPrismaService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: mockAppService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(controller).toBeDefined();
  });

  it('turi grąžinti "Hello World!"', () => {
    expect(controller.getHello()).toBe('Hello World!');
    expect(mockAppService.getHello).toHaveBeenCalled();
  });
});