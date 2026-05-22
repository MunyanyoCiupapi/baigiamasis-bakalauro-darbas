import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Auth integraciniai testai', () => {
  let app: INestApplication;
  let accessToken: string;

  const uniqueId = Date.now();
  const testUser = {
    email: `test_${uniqueId}@example.com`,
    password: 'Test123456',
    displayName: 'Test User',
    role: 'ARTIST',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('turi sėkmingai užregistruoti naują vartotoją (FR-01)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.user.displayName).toBe(testUser.displayName);
    expect(response.body.user.role).toBe(testUser.role);
  });

  it('turi atmesti pakartotinę registraciją su tuo pačiu el. paštu', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/register')
      .send(testUser);

    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('message');
  });

  it('turi sėkmingai prijungti vartotoją su teisingais duomenimis (FR-02)', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('accessToken');
    expect(response.body).toHaveProperty('user');
    expect(response.body.user.email).toBe(testUser.email);
    expect(response.body.user.displayName).toBe(testUser.displayName);

    accessToken = response.body.accessToken;
  });

  it('turi atmesti prisijungimą su neteisingu slaptažodžiu', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: testUser.email,
        password: 'Neteisingas123',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('turi atmesti prisijungimą, kai vartotojas neegzistuoja', async () => {
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `nerastas_${Date.now()}@example.com`,
        password: 'Test123456',
      });

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('turi atmesti prieigą prie apsaugoto endpointo be autentifikacijos (NFR-04)', async () => {
    const response = await request(app.getHttpServer())
      .get('/assets/my-uploads');

    expect(response.status).toBe(401);
    expect(response.body).toHaveProperty('message');
  });

  it('turi leisti prieigą prie apsaugoto endpointo su galiojančiu tokenu (NFR-04)', async () => {
    const response = await request(app.getHttpServer())
      .get('/assets/my-uploads')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});