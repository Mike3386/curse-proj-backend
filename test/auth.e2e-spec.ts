import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ImagesModule } from '../src/images/images.module';
import { TagsModule } from '../src/tags/tags.module';
import { DataSource } from 'typeorm';
import { loginUser, registerUser } from './base-actions';
import { AuthUser, testUser } from './data';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authUser: AuthUser;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule, AuthModule, ImagesModule, TagsModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    await app.init();

    dataSource = app.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    await app.close();
  });

  it('register', async () => {
    const res = await registerUser(app, testUser);

    expect(res.status).toBe(201);
    expect(res.body).not.toBeNull();
  });

  it('login', async () => {
    const res = await loginUser(app, testUser);

    expect(res.status).toBeLessThanOrEqual(201);
    expect(res.body).not.toBeNull();

    authUser = res.body;
  });
});
