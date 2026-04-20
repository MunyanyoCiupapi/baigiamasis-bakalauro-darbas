import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController autentifikavimo užklausos', () => {
  let controller: AuthController;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(controller).toBeDefined();
  });

  it('turi perduoti registracijos duomenis servisui', async () => {
    const body = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Jonas',
      role: 'USER',
    };

    const serviceResult = {
      message: 'Registracija sėkminga',
      user: {
        id: 'user-1',
        email: body.email,
        displayName: body.displayName,
        role: body.role,
      },
    };

    mockAuthService.register.mockResolvedValue(serviceResult);

    const result = await controller.register(body);

    expect(mockAuthService.register).toHaveBeenCalledWith(body);
    expect(result).toEqual(serviceResult);
  });

  it('turi perduoti prisijungimo duomenis servisui', async () => {
    const body = {
      email: 'test@example.com',
      password: 'password123',
    };

    const serviceResult = {
      message: 'Prisijungimas sėkmingas',
      accessToken: 'fake-token',
      user: {
        id: 'user-1',
        email: body.email,
        displayName: 'Jonas',
        role: 'USER',
      },
    };

    mockAuthService.login.mockResolvedValue(serviceResult);

    const result = await controller.login(body);

    expect(mockAuthService.login).toHaveBeenCalledWith(body);
    expect(result).toEqual(serviceResult);
  });
});