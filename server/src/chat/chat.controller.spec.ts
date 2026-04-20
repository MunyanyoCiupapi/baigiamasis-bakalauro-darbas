import { Test, TestingModule } from '@nestjs/testing';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

describe('ChatController pokalbių užklausos', () => {
  let controller: ChatController;

  const mockChatService = {
    getConversation: jest.fn(),
    getInbox: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        {
          provide: ChatService,
          useValue: mockChatService,
        },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('turi būti sukurtas', () => {
    expect(controller).toBeDefined();
  });

  it('turi grąžinti pokalbio istoriją', async () => {
    const messages = [
      { senderId: 'u1', receiverId: 'u2', text: 'Labas' },
      { senderId: 'u2', receiverId: 'u1', text: 'Sveikas' },
    ];

    mockChatService.getConversation.mockResolvedValue(messages);

    const result = await controller.getHistory('u1', 'u2');

    expect(mockChatService.getConversation).toHaveBeenCalledWith('u1', 'u2');
    expect(result).toEqual(messages);
  });

  it('turi grąžinti vartotojo gautuosius pokalbius', async () => {
    const inbox = [
      {
        id: 'u2',
        displayName: 'Petras',
        lastMessage: 'Labas',
      },
    ];

    mockChatService.getInbox.mockResolvedValue(inbox);

    const result = await controller.getInbox('u1');

    expect(mockChatService.getInbox).toHaveBeenCalledWith('u1');
    expect(result).toEqual(inbox);
  });
});