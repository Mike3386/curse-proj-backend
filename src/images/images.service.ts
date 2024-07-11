import { Rating } from './../rating/rating.entity';
import {
  Inject,
  Injectable,
  forwardRef,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { User } from '../users/user.entity';
import { Image, SearchType } from './image.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Any, EntityManager, In, IsNull, MoreThan, Repository } from 'typeorm';
import { TagsService } from '../tags/tags.service';
import { Tag } from '../tags/tag.entity';
import { Comment } from '../comments/comment.entity';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class ImagesService {
  constructor(
    @InjectRepository(Image)
    private imagesRepository: Repository<Image>,
    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @Inject(forwardRef(() => TagsService))
    private tagsService: TagsService,
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    config: ConfigService,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
  ) {
    cloudinary.config({
      api_key: config.get('CLOUDINARY_API_KEY'),
      api_secret: config.get('CLOUDINARY_API_SECRET'),
      cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
      secure: true,
    });
  }

  async uploadWithoutUser(image: Express.Multer.File) {
    try {
      const result = await cloudinary.uploader.upload(
        `data:image/jpeg;base64,${image.buffer.toString('base64')}`,
        { type: 'authenticated', sign_url: true },
      );

      const expiredAt = Date.now() / 1000 + 3600 * 24;

      const privateLink = cloudinary.utils.private_download_url(
        result.public_id,
        result.format,
        { expires_at: expiredAt, type: 'authenticated' },
      );

      const createdImage = await this.imagesRepository.save({
        link: result.url,
        publicId: result.public_id,
        privateLink,
        name: image.originalname,
        expiredAt: new Date(expiredAt * 1000),
        isPublic: true,
      });

      const tags = await this.tagsService.getTagsForImage(createdImage.id, 10);

      if (tags) {
        await this.tagsService.createTagsForImage(
          createdImage.id,
          tags.map((tag) => ({ name: tag.name })),
        );
      }
      return await this.imagesRepository
        .findOne({
          where: { id: createdImage.id },
          relations: ['tags'],
        })
        .then((image) => {
          return {
            id: image?.id,
            link: image?.privateLink,
            tags: image?.tags,
          };
        });
    } catch (error) {
      console.error(error);
    }
  }

  async upload(user: User, images: Express.Multer.File[], name?: string) {
    try {
      const imagesRes: Image[] = [];
      const controlFunc = async (image: Express.Multer.File) => {
        const result = await cloudinary.uploader.upload(
          `data:image/jpeg;base64,${image.buffer.toString('base64')}`,
          {
            filename_override: name,
            type: 'authenticated',
            sign_url: true,
          },
        );

        const expiredAt = Date.now() / 1000 + 3600 * 24 * 365;

        const privateLink = cloudinary.utils.private_download_url(
          result.public_id,
          result.format,
          { expires_at: expiredAt, type: 'authenticated' },
        );

        const createdImage = await this.imagesRepository.save({
          userId: user.id,
          link: result.url,
          publicId: result.public_id,
          privateLink,
          expiredAt: new Date(expiredAt * 1000),
          name: name || image.originalname,
          isPublic: false,
        });

        const tags = await this.tagsService.getTagsForImage(
          createdImage.id,
          10,
        );

        if (tags) {
          await this.tagsService.createTagsForImage(
            createdImage.id,
            tags.map((tag) => ({ name: tag.name })),
          );
        }

        return this.imagesRepository.findOne({
          where: { id: createdImage.id },
          relations: ['tags'],
        });
      };
      let promise: any = Promise.resolve();
      images.forEach((image) => {
        promise = promise.then(() =>
          controlFunc(image).then((img) => img && imagesRes.push(img)),
        );
      });
      // return Promise.all(
      //   images.map(async (image) => {
      //
      //   }),
      // );
      await promise;
      return imagesRes;
    } catch (error) {
      console.error(error);
    }
  }

  async remove(imageId: string) {
    try {
      const image = await this.imagesRepository.findOneBy({
        id: imageId,
      });

      if (!image) {
        return;
      }

      const tags = await this.tagsService.listImageTags(imageId);

      await Promise.all(
        tags.map((tag) =>
          this.imagesRepository
            .createQueryBuilder()
            .relation(Image, 'tags')
            .of(image)
            .remove(tag),
        ),
      );
      await Promise.all([
        this.imagesRepository.delete(imageId),
        cloudinary.uploader.destroy(image.publicId),
      ]);
    } catch (err) {
      console.error(err);
      throw err;
    }
  }

  async getById(imageId: string) {
    this.addViews([imageId]);

    return this.imagesRepository.findOne({
      where: { id: imageId },
      relations: { tags: true },
    });
  }

  async getPublicImage(imageId: string) {
    return this.imagesRepository
      .findOne({
        where: { id: imageId },
        relations: {
          tags: true,
          favouriteByUsers: true,
        },
      })
      .then((image) => {
        image && this.addViews([image.id]);

        return {
          id: image?.id,
          link: image?.privateLink,
          tags: image?.tags,
          favouriteByUsers: image?.favouriteByUsers,
          userId: image?.userId,
        };
      });
  }

  async getLasPublicImages(
    limit = 10,
    offset = 0,
    email: string | undefined = undefined,
    tags: Tag[] = [],
    type = 0,
    searchType: SearchType = 'uploadedAt',
  ) {
    const baseWhere = {
      isPublic: true,
      isBlocked: false,
      expiredAt: MoreThan(new Date()),
      ...(tags.length
        ? {
            tags: {
              id: Any(tags.map((tag) => tag.id)),
            },
          }
        : {}),
    };
    return this.imagesRepository
      .findAndCount({
        where: [
          {
            ...baseWhere,
            isBlocked: false,
          },
        ],
        relations: {
          tags: true,
          user: true,
          favouriteByUsers: true,
        },
        skip: !Number(type) ? offset : undefined,
        take: !Number(type) ? limit : undefined,
        order: {
          [searchType]: {
            direction: 'DESC',
            nulls: 'LAST',
          },
        },
      })
      .then(async ([images, amount]) => {
        if (!Number(type)) return [images, amount] as [Image[], number];
        const ids = tags.map((tag) => tag.id);
        const filtered = images
          .filter((image) => {
            return (
              image.tags.filter((tag) => ids.includes(tag.id as any)).length ===
              ids.length
            );
          })
          .slice(offset, offset + limit);
        return [filtered, amount] as [Image[], number];
      })
      .then(async ([images, amount]) => {
        const imagesWithTags = await this.imagesRepository.find({
          where: {
            id: In(images.map((image) => image.id)),
          },
          relations: {
            tags: true,
            user: true,
            favouriteByUsers: true,
          },
          order: {
            [searchType]: {
              direction: 'DESC',
              nulls: 'LAST',
            },
          },
        });

        return [imagesWithTags, amount] as [Image[], number];
      })
      .then(async ([images, amount]) => {
        const user = email && (await this.usersService.findOneByEmail(email));
        await Promise.all(
          images.map((image) => {
            return Promise.all([
              user &&
                this.ratingRepository
                  .findOne({
                    where: {
                      userId: user.id,
                      imageId: image.id,
                    },
                  })
                  .then((data) => {
                    //@ts-ignore
                    image.userRating = data?.rating;
                  }),
              this.commentRepository
                .count({
                  where: {
                    imageId: image.id,
                  },
                })
                .then((amount) => {
                  //@ts-ignore
                  image.commentsCount = amount;
                }),
            ]);
          }),
        );

        await this.addViews(images.map((image) => image.id));

        return {
          images,
          amount,
        };
      });
  }

  async getImages(user: User, limit = 10, offset = 0) {
    return Promise.all([
      this.imagesRepository.find({
        where: {
          userId: user.id,
        },
        relations: ['tags'],
        take: limit,
        skip: offset,
        order: {
          uploadedAt: 'DESC',
        },
      }),
      this.imagesRepository.count({
        where: {
          userId: user.id,
        },
      }),
    ])
      .then(([images, count]) => {
        return {
          images,
          count,
        };
      })
      .then((res) => {
        // this.addViews(res.images.map((image) => image.id));
        return res;
      });
  }

  async getImagesByTags(tags: Tag[] = [], limit = 10, offset = 0) {
    return this.imagesRepository
      .find({
        where: {
          tags: {
            id: Any(tags.map((tag) => tag.id)),
          },
          isPublic: true,
          isBlocked: false,
          expiredAt: MoreThan(new Date()),
        },
        loadRelationIds: true,
        relations: ['tags'],
        take: limit,
        skip: offset,
        order: {
          uploadedAt: 'DESC',
        },
      })
      .then(async (images) => {
        const ids = tags.map((tag) => tag.id);
        const filtered = images.filter((image) => {
          return (
            image.tags.filter((tag) => ids.includes(tag as any)).length ===
            ids.length
          );
        });
        return {
          filtered,
          count: filtered.length,
        };
      })
      .then(async ({ filtered, count }) => {
        const imagesWithTags = await this.imagesRepository.find({
          where: {
            id: In(filtered.map((image) => image.id)),
          },
          relations: ['tags'],
          order: {
            uploadedAt: 'DESC',
          },
        });

        return {
          images: imagesWithTags,
          count,
        };
      })
      .then((res) => {
        // this.addViews(res.images.map((image) => image.id));
        return res;
      });
  }

  async getByAdmin(limit = 10, offset = 0) {
    return await this.imagesRepository
      .findAndCount({
        where: [
          {
            isBlocked: false,
            expiredAt: MoreThan(new Date()),
          },
          {
            isBlocked: false,
            expiredAt: IsNull(),
          },
        ],
        take: limit,
        skip: offset,
        order: {
          uploadedAt: 'DESC',
        },
        relations: ['user'],
      })
      .then(([images, count]) => {
        return {
          images,
          count,
        };
      });
  }

  async removeImageAdmin(imageId: string) {
    const image = await this.imagesRepository.findOne({
      where: { id: imageId },
    });

    const tags = await this.tagsService.listImageTags(imageId);

    await Promise.all(
      tags.map((tag) =>
        this.imagesRepository
          .createQueryBuilder()
          .relation(Image, 'tags')
          .of(image)
          .remove(tag),
      ),
    );

    return await Promise.all([
      image && cloudinary.uploader.destroy(image?.publicId),
      image && this.imagesRepository.delete(imageId),
    ]);
  }

  async blockUserImages(userId: string) {
    return await this.imagesRepository.update(
      {
        userId,
      },
      {
        isBlocked: true,
      },
    );
  }

  async addViews(imagesId: string[]) {
    return Promise.all(
      imagesId.map((id) => {
        return this.imagesRepository
          .createQueryBuilder()
          .update(Image)
          .set({ viewCount: () => '"viewCount" + 1' })
          .where('id = :id', { id })
          .execute();
      }),
    );
  }

  async addFavourite(userId: string, imageId: string) {
    const [user, image] = await Promise.all([
      this.usersService.findOne(userId),
      this.imagesRepository.findOne({ where: { id: imageId } }),
    ]);
    await this.entityManager
      .createQueryBuilder()
      .relation(User, 'favourite')
      .of(user)
      .add(image);
  }

  async removeFavourite(userId: string, imageId: string) {
    const [user, image] = await Promise.all([
      this.usersService.findOne(userId),
      this.imagesRepository.findOne({ where: { id: imageId } }),
    ]);
    await this.entityManager
      .createQueryBuilder()
      .relation(User, 'favourite')
      .of(user)
      .remove(image);
  }

  async listFavoured(userId: string, limit = 20, offset = 0) {
    return this.imagesRepository
      .findAndCount({
        where: {
          favouriteByUsers: {
            id: userId,
          },
          isPublic: true,
          expiredAt: MoreThan(new Date()),
        },
        take: limit,
        skip: offset,
        relations: {
          favouriteByUsers: true,
          tags: true,
        },
      })
      .then(([images, amount]) => {
        return {
          images,
          amount,
        };
      });
  }

  async makePublic(imageId: string) {
    await this.imagesRepository.update({ id: imageId }, { isPublic: true });

    return this.imagesRepository.findOne({ where: { id: imageId } });
  }

  async makePrivate(imageId: string) {
    await this.imagesRepository.update({ id: imageId }, { isPublic: false });

    return this.imagesRepository.findOne({ where: { id: imageId } });
  }

  async addRating(rating: number, imageId: string, userId: string) {
    const oldRating = await this.ratingRepository.findOne({
      where: {
        userId,
        imageId,
      },
      relations: {
        image: true,
      },
    });

    const image = await this.imagesRepository.findOne({
      where: { id: imageId },
    });

    if (image && image.userId === userId)
      throw new HttpException(
        'Not allowed to add rating by owner',
        HttpStatus.CONFLICT,
      );

    if (oldRating) {
      oldRating.rating = Number(rating);
      await this.ratingRepository.save(oldRating);
    } else {
      try {
        await this.ratingRepository.save({
          rating: Number(rating),
          imageId,
          userId,
        });
      } catch (err) {
        console.log(err);
      }
    }

    return await this.imagesRepository.findOne({ where: { id: imageId } });
  }
}
