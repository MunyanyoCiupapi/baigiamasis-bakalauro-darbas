import { Test, TestingModule } from '@nestjs/testing';
import { ChatService } from './chat.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ChatService žinučių funkcionalumas', () => {
  let service: ChatService;

  const mockPrismaService = {
    message: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(service).toBeDefined();
  });

  it('turi išsaugoti žinutę', async () => {
    const savedMessage = {
      id: 'msg-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      text: 'Labas',
    };

    mockPrismaService.message.create.mockResolvedValue(savedMessage);

    const result = await service.saveMessage('user-1', 'user-2', 'Labas');

    expect(mockPrismaService.message.create).toHaveBeenCalledWith({
      data: {
        senderId: 'user-1',
        receiverId: 'user-2',
        text: 'Labas',
      },
    });
    expect(result).toEqual(savedMessage);
  });

  it('turi grąžinti pokalbio istoriją pagal sukūrimo laiką didėjančia tvarka', async () => {
    const messages = [
      { senderId: 'user-1', receiverId: 'user-2', text: 'A' },
      { senderId: 'user-2', receiverId: 'user-1', text: 'B' },
    ];

    mockPrismaService.message.findMany.mockResolvedValue(messages);

    const result = await service.getConversation('user-1', 'user-2');

    expect(mockPrismaService.message.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { senderId: 'user-1', receiverId: 'user-2' },
          { senderId: 'user-2', receiverId: 'user-1' },
        ],
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    expect(result).toEqual(messages);
  });

  it('turi grąžinti kontaktų sąrašą be pasikartojimų', async () => {
    const mockMessages = [
      {
        senderId: 'user-1',
        receiverId: 'user-2',
        text: 'Pirma žinutė',
        createdAt: new Date('2024-01-02'),
        sender: { id: 'user-1', displayName: 'Jonas' },
        receiver: { id: 'user-2', displayName: 'Petras' },
      },
      {
        senderId: 'user-2',
        receiverId: 'user-1',
        text: 'Atsakymas',
        createdAt: new Date('2024-01-01'),
        sender: { id: 'user-2', displayName: 'Petras' },
        receiver: { id: 'user-1', displayName: 'Jonas' },
      },
    ];

    mockPrismaService.message.findMany.mockResolvedValue(mockMessages);

    const result = await service.getInbox('user-1');

    expect(mockPrismaService.message.findMany).toHaveBeenCalled();
    expect(result).toEqual([
      {
        id: 'user-2',
        displayName: 'Petras',
        lastMessage: 'Pirma žinutė',
        lastDate: new Date('2024-01-02'),
      },
    ]);
  });
});