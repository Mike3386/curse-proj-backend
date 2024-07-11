import { AuthModule } from '../src/auth/auth.module';
import { UsersModule } from '../src/users/users.module';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { ImagesModule } from '../src/images/images.module';
import { TagsModule } from '../src/tags/tags.module';
import { Image } from '../src/images/image.entity';
import {
  addFavourite,
  addUser,
  loadFavouriteImages,
  loadPublicImages,
  setRatingOfImage,
  toggleImageAccessPrivate,
  toggleImageAccessPublic,
  uploadImageWithUser,
} from './base-actions';
import { AuthUser, testUser, testTags, testUser2, testUser3 } from './data';
import { mockOutServices } from './mock';

describe('Authorized (e2e)', () => {
  let app: INestApplication;
  let authUser1: AuthUser;
  let authUser2: AuthUser;
  let authUser3: AuthUser;
  let loadedImage: Image;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, UsersModule, AuthModule, ImagesModule, TagsModule],
    }).compile();
    app = moduleFixture.createNestApplication();

    await app.init();

    mockOutServices();

    authUser1 = (await addUser(app, testUser)).body;
    authUser2 = (await addUser(app, testUser2)).body;
    authUser3 = (await addUser(app, testUser3)).body;
    jest.setTimeout(20000);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should upload image with user', async () => {
    const res = await uploadImageWithUser(app, authUser1);
    loadedImage = res.body[0];
    expect(res.status).toBe(201);
    expect(res.body[0].tags.map((tag: any) => tag.name).sort()).toEqual(
      testTags.map((tag) => tag.tag.ru).sort(),
    );
  });

  it('should toggle accessType of uploaded image to public', async () => {
    const { body: publicImages1 } = await loadPublicImages(app, authUser1);
    expect(publicImages1.amount).toBe(0);

    const res = await toggleImageAccessPublic(app, loadedImage.id, authUser1);

    expect(res.status).toBe(200);
    expect(res.body.isPublic).toBe(true);

    const { body: publicImages2 } = await loadPublicImages(app, authUser1);
    expect(publicImages2.amount).toBe(1);
  });

  it('should recalculate rating', async () => {
    await setRatingOfImage(app, authUser2, loadedImage.id, 5);
    await setRatingOfImage(app, authUser3, loadedImage.id, 1);

    const { body: publicImages } = await loadPublicImages(app, authUser1);
    expect(Number(publicImages.images[0].rate)).toBe(3);
  });

  it('should throw error when user is owner of image', async () => {
    expect(
      (await setRatingOfImage(app, authUser1, loadedImage.id, 1)).status,
    ).toBe(409);
  });

  it('should add favourite image to user', async () => {
    expect((await loadFavouriteImages(app, authUser2)).body.amount).toBe(0);

    await addFavourite(app, authUser2, loadedImage.id);

    expect((await loadFavouriteImages(app, authUser2)).body.amount).toBe(1);
  });

  it('should toggle accessType of uploaded image to private', async () => {
    const { body: publicImages1 } = await loadPublicImages(app, authUser1);
    expect(publicImages1.amount).toBe(1);

    const res = await toggleImageAccessPrivate(app, loadedImage.id, authUser1);

    expect(res.status).toBe(200);
    expect(res.body.isPublic).toBe(false);

    const { body: publicImages2 } = await loadPublicImages(app, authUser1);
    expect(publicImages2.amount).toBe(0);
  });
});
