import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { ImagesModule } from '../src/images/images.module';
import { TagsModule } from '../src/tags/tags.module';
import { uploadImageNoUser } from './base-actions';

import { mockOutServices } from './mock';

describe('Unauthorized (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule, AuthModule, ImagesModule, TagsModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    await app.init();

    mockOutServices();
  });

  afterAll(async () => {
    await app.close();
  });

  it('add image', async () => {
    const res = await uploadImageNoUser(app);

    expect(res.status).toBe(201);
    expect(res.body).not.toBeNull();
    expect(res.body.expiredAt);
  });
});
