import got, { CancelableRequest } from 'got';
import { ImaggaAnswer } from '../src/tags/tags.service';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { testImage, testImagePrivateLink, testTags } from './data';

export function mockOutServices() {
  const spyUploaderUpload = jest.spyOn(cloudinary.uploader, 'upload');
  spyUploaderUpload.mockImplementation(async (file) => {
    return testImage as UploadApiResponse;
  });

  const spyUploaderDestroy = jest.spyOn(cloudinary.uploader, 'destroy');
  spyUploaderDestroy.mockImplementation(async (file) => {
    return null;
  });

  const spyUploaderPrivateLink = jest.spyOn(
    cloudinary.utils,
    'private_download_url',
  );
  spyUploaderPrivateLink.mockImplementation((publicId, format, opts) => {
    return testImagePrivateLink;
  });

  const spyGotGet = jest.spyOn(got, 'get');
  spyGotGet.mockImplementation(() => {
    return Promise.resolve({
      body: JSON.stringify({
        result: {
          tags: testTags,
        },
      }),
    }) as any;
  });
}
