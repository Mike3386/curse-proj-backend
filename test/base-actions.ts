import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { LoginUser, AuthUser } from './data';

export async function addUser(
  app: INestApplication,
  user: { email: string; password: string },
) {
  await registerUser(app, user);
  return await loginUser(app, user);
}

export async function loginUser(app: INestApplication, user: LoginUser) {
  return await request(app.getHttpServer()).post('/auth/login').send(user);
}

export async function registerUser(app: INestApplication, user: LoginUser) {
  return await request(app.getHttpServer()).post('/auth/register').send(user);
}

export async function uploadImageNoUser(app: INestApplication) {
  return await request(app.getHttpServer())
    .post('/images/image-no-user')
    .attach('image', 'test/images/09.jpg');
}

export async function uploadImageWithUser(
  app: INestApplication,
  user: AuthUser,
) {
  return await request(app.getHttpServer())
    .post('/images')
    .set('Authorization', `Bearer ${user.access_token}`)
    .attach('images[]', 'test/images/09.jpg');
}

export async function toggleImageAccessPublic(
  app: INestApplication,
  imageId: string,
  user: AuthUser,
) {
  return await request(app.getHttpServer())
    .put(`/images/${imageId}/public`)
    .set('Authorization', `Bearer ${user.access_token}`);
}

export async function toggleImageAccessPrivate(
  app: INestApplication,
  imageId: string,
  user: AuthUser,
) {
  return await request(app.getHttpServer())
    .put(`/images/${imageId}/private`)
    .set('Authorization', `Bearer ${user.access_token}`);
}

export async function loadPublicImages(app: INestApplication, user?: AuthUser) {
  return await request(app.getHttpServer())
    .get('/images/last-public-images')
    .query({ email: user?.email });
  // .set('Authorization', `Bearer ${user.access_token}`)
}

export async function setRatingOfImage(
  app: INestApplication,
  user: AuthUser,
  imageId: string,
  rate: number,
) {
  return await request(app.getHttpServer())
    .put(`/images/${imageId}/rate`)
    .query({ rate })
    .set('Authorization', `Bearer ${user.access_token}`);
}

export async function addFavourite(
  app: INestApplication,
  user: AuthUser,
  imageId: string,
) {
  return await request(app.getHttpServer())
    .put(`/images/${imageId}/favourite`)
    .set('Authorization', `Bearer ${user.access_token}`);
}

export async function deleteFavourite(
  app: INestApplication,
  user: AuthUser,
  imageId: string,
) {
  return await request(app.getHttpServer())
    .delete(`/images/${imageId}/favourite`)
    .set('Authorization', `Bearer ${user.access_token}`);
}

export async function loadFavouriteImages(
  app: INestApplication,
  user: AuthUser,
) {
  return await request(app.getHttpServer())
    .get('/images/favourite-images')
    .set('Authorization', `Bearer ${user.access_token}`);
}

export async function loadAdminImages(app: INestApplication, user: AuthUser) {
  return await request(app.getHttpServer())
    .get('/admin/images')
    .set('Authorization', `Bearer ${user.access_token}`);
}

export async function adminRemoveImage(
  app: INestApplication,
  user: AuthUser,
  removeImageId: string,
) {
  return await request(app.getHttpServer())
    .delete(`/admin/images/${removeImageId}`)
    .set('Authorization', `Bearer ${user.access_token}`);
}

export async function adminBlockUser(
  app: INestApplication,
  user: AuthUser,
  blockUserId: string,
) {
  return await request(app.getHttpServer())
    .post(`/admin/images/users/${blockUserId}/block`)
    .set('Authorization', `Bearer ${user.access_token}`);
}
