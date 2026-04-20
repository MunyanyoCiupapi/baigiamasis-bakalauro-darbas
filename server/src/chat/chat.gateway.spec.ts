import { Test, TestingModule } from '@nestjs/testing';
import { ChatGateway } from './chat.gateway';
import { ChatService } from './chat.service';

describe('ChatGateway realaus laiko komunikacija', () => {
  let gateway: ChatGateway;

  const mockChatService = {
    saveMessage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
    gateway.server = {
      to: jest.fn().mockReturnValue({
        emit: jest.fn(),
      }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(gateway).toBeDefined();
  });

  it('turi prijungti vartotoją prie pokalbio kambario', () => {
    const client = {
      join: jest.fn(),
    } as any;

    gateway.handleJoinChat('user-1', client);

    expect(client.join).toHaveBeenCalledWith('user-1');
  });

  it('turi išsaugoti ir išsiųsti žinutę', async () => {
    const client = {
      emit: jest.fn(),
    } as any;

    const savedMessage = {
      id: 'msg-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      text: 'Labas',
    };

    mockChatService.saveMessage.mockResolvedValue(savedMessage);

    await gateway.handleMessage(
      {
        senderId: 'user-1',
        receiverId: 'user-2',
        text: 'Labas',
      },
      client,
    );

    expect(mockChatService.saveMessage).toHaveBeenCalledWith(
      'user-1',
      'user-2',
      'Labas',
    );
    expect(client.emit).toHaveBeenCalledWith('newMessage', savedMessage);
  });
});