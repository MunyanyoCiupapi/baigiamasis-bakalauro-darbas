import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Chat integraciniai testai', () => {
  let app: INestApplication;
  let token: string;

  const user = {
    email: `chat_${Date.now()}@test.com`,
    password: '123456',
    displayName: 'Chat User',
    role: 'USER',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    
    await request(app.getHttpServer()).post('/auth/register').send(user);

    const login = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: user.email,
        password: user.password,
      });

    token = login.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  it('turi gauti pokalbio istoriją (FR-15)', async () => {
    const res = await request(app.getHttpServer())
      .get('/chat/conversation/user-2')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 404]).toContain(res.status);
  });
});