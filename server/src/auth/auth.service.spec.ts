import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('AuthService autentifikavimo funkcionalumas', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(service).toBeDefined();
  });

  it('turi sėkmingai užregistruoti naują vartotoją', async () => {
    const body = {
      email: 'test@example.com',
      password: 'password123',
      displayName: 'Test User',
      role: 'USER',
    };

    const createdUser = {
      id: 'user-1',
      email: 'test@example.com',
      displayName: 'Test User',
      role: 'USER',
      createdAt: new Date(),
    };

    mockPrismaService.user.findUnique.mockResolvedValue(null);
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
    mockPrismaService.user.create.mockResolvedValue(createdUser);

    const result = await service.register(body);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: body.email },
    });

    expect(bcrypt.hash).toHaveBeenCalledWith(body.password, 10);

    expect(mockPrismaService.user.create).toHaveBeenCalledWith({
      data: {
        email: body.email,
        passwordHash: 'hashed-password',
        displayName: body.displayName,
        role: 'USER',
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        role: true,
        createdAt: true,
      },
    });

    expect(result).toEqual({
      message: 'Registracija sėkminga',
      user: createdUser,
    });
  });

  it('turi grąžinti klaidą, kai registracijos metu trūksta privalomų laukų', async () => {
    await expect(
      service.register({
        email: '',
        password: '',
        displayName: '',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi grąžinti klaidą, kai el. paštas jau naudojamas', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue({
      id: 'existing-user',
      email: 'test@example.com',
    });

    await expect(
      service.register({
        email: 'test@example.com',
        password: 'password123',
        displayName: 'Test User',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('turi sėkmingai prijungti vartotoją su teisingais duomenimis', async () => {
    const body = {
      email: 'test@example.com',
      password: 'password123',
    };

    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      displayName: 'Test User',
      role: 'USER',
      createdAt: new Date(),
    };

    mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    mockJwtService.signAsync.mockResolvedValue('fake-jwt-token');

    const result = await service.login(body);

    expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
      where: { email: body.email },
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      body.password,
      existingUser.passwordHash,
    );

    expect(mockJwtService.signAsync).toHaveBeenCalledWith({
      sub: existingUser.id,
      email: existingUser.email,
      role: existingUser.role,
      displayName: existingUser.displayName,
    });

    expect(result).toEqual({
      message: 'Prisijungimas sėkmingas',
      accessToken: 'fake-jwt-token',
      user: {
        id: existingUser.id,
        email: existingUser.email,
        displayName: existingUser.displayName,
        role: existingUser.role,
        createdAt: existingUser.createdAt,
      },
    });
  });

  it('turi grąžinti klaidą, kai vartotojas nerastas', async () => {
    mockPrismaService.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'wrong@example.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('turi grąžinti klaidą, kai slaptažodis neteisingas', async () => {
    const existingUser = {
      id: 'user-1',
      email: 'test@example.com',
      passwordHash: 'hashed-password',
      displayName: 'Test User',
      role: 'USER',
      createdAt: new Date(),
    };

    mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });
});