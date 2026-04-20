import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../../src/app.module';

describe('Assets integraciniai testai', () => {
  let app: INestApplication;

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

  it('turi grąžinti kūrinių sąrašą (FR-03)', async () => {
    const res = await request(app.getHttpServer())
      .get('/assets');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('turi grąžinti klaidą ieškant neegzistuojančio kūrinio (FR-05)', async () => {
    const res = await request(app.getHttpServer())
      .get('/assets/neegzistuojantis-id');

    expect(res.status).toBe(404);
  });
});