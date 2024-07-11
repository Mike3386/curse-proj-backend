import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ImagesModule } from '../src/images/images.module';
import { TagsModule } from '../src/tags/tags.module';
import { Image } from '../src/images/image.entity';
import {
  addUser,
  adminBlockUser,
  adminRemoveImage,
  loadAdminImages,
  loginUser,
  uploadImageWithUser,
} from './base-actions';
import { AuthUser, testUser, adminUser } from './data';
import { mockOutServices } from './mock';

describe('Authorized (e2e)', () => {
  let app: INestApplication;
  let authUser1: AuthUser;
  let authAdminUser: AuthUser;
  let loadedImage: Image;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule, AuthModule, ImagesModule, TagsModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    await app.init();

    mockOutServices();

    authUser1 = (await addUser(app, testUser)).body;
    authAdminUser = (await loginUser(app, adminUser)).body;
    jest.setTimeout(20000);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should block user with images', async () => {
    expect((await loadAdminImages(app, authAdminUser)).body.count).toBe(0);

    const res = await uploadImageWithUser(app, authUser1);
    loadedImage = res.body[0];

    expect((await loadAdminImages(app, authAdminUser)).body.count).toBe(1);

    await adminBlockUser(app, authAdminUser, authUser1.id);

    expect((await loadAdminImages(app, authAdminUser)).body.count).toBe(0);
  });

  it('should delete image', async () => {
    expect((await loadAdminImages(app, authAdminUser)).body.count).toBe(0);

    const res = await uploadImageWithUser(app, authUser1);
    loadedImage = res.body[0];

    expect((await loadAdminImages(app, authAdminUser)).body.count).toBe(1);

    await adminRemoveImage(app, authAdminUser, loadedImage.id);

    expect((await loadAdminImages(app, authAdminUser)).body.count).toBe(0);
  });
});
