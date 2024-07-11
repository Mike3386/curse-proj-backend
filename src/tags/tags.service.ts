import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { CreateTagDto, Tag } from './tag.entity';
import { Image } from '../images/image.entity';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import {
  EntityManager,
  Like,
  Repository,
  ILike,
  Not,
  In,
  IsNull,
} from 'typeorm';
import { ImagesService } from '../images/images.service';
import { ConfigService } from '@nestjs/config';
import got from 'got';
import { User } from '../users/user.entity';

interface ImaggaConfig {
  username: string;
  password: string;
}

export interface ImaggaAnswer {
  result: {
    tags: [
      {
        confidence: number;
        tag: {
          ru: string;
        };
      },
    ];
  };
  status: {
    type: string;
    text: string;
  };
}

@Injectable()
export class TagsService {
  imaggaConfig: ImaggaConfig;
  constructor(
    @InjectRepository(Tag)
    private tagsRepository: Repository<Tag>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @Inject(forwardRef(() => ImagesService))
    private imagesService: ImagesService,
    private config: ConfigService,
  ) {
    this.imaggaConfig = {
      username: config.get<string>('IMAGGA_API_KEY') || '',
      password: config.get<string>('IMAGGA_API_SECRET') || '',
    };
  }

  async getTagsForImage(imageId: string, count = 10) {
    const image = await this.imagesService.getById(imageId);
    if (!image) return;

    try {
      const { body } = await got.get(
        `https://api.imagga.com/v2/tags?limit=${count}&language=ru&image_url=${encodeURIComponent(
          image.link,
        )}`,
        {
          ...this.imaggaConfig,
        },
      );

      const data = (JSON.parse(body) as ImaggaAnswer).result.tags.map(
        (tag) => ({
          name: tag.tag.ru,
          confidence: tag.confidence,
        }),
      );

      return Promise.resolve(data);
    } catch (err) {
      console.log(err);
    }
  }

  async createTagsForImage(imageId: string, tagsData: CreateTagDto[]) {
    const image = await this.imagesService.getById(imageId);

    if (!image) return;

    const filteredTags: CreateTagDto[] = [];
    tagsData.forEach((el) => {
      if (
        !filteredTags.find(
          (e) => e.name.toLowerCase() === el.name.toLowerCase(),
        ) &&
        !el.name.match(/[a-zA-Z]/) &&
        !image.tags.find(
          (tag) => tag.name.toLowerCase() === el.name.toLowerCase(),
        )
      ) {
        el.name = el.name[0].toUpperCase() + el.name.slice(1);
        filteredTags.push(el);
      }
    }, [] as CreateTagDto[]);

    const tags = await Promise.all(
      filteredTags.map((tagData) => this.fetchOrCreate(tagData)),
    );

    await Promise.all(
      tags.map((tag) =>
        this.entityManager
          .createQueryBuilder()
          .relation(Image, 'tags')
          .of(image)
          .add(tag),
      ),
    );

    return tags;
  }

  async fetchOrCreate(tagData: CreateTagDto): Promise<Tag> {
    const tag = await this.tagsRepository.findOneBy({ name: tagData.name });
    if (tag) return tag;
    return tag ? tag : await this.tagsRepository.save(tagData);
  }

  async deleteTagFromImage(imageId: string, tagId: string) {
    const [image, tag] = await Promise.all([
      this.imagesService.getById(imageId),
      this.tagsRepository.findOne({ where: { id: tagId } }),
    ]);

    return await this.entityManager
      .createQueryBuilder()
      .relation(Image, 'tags')
      .of(image)
      .remove(tag);
  }

  async tagsAutocomplete(text = '', selectedIds: string[] = []) {
    return this.tagsRepository.find({
      where: {
        id: Not(In(selectedIds)),
        name: ILike('%' + text + '%'),
        images: {
          isPublic: true,
          isBlocked: false,
        },
      },
      loadRelationIds: true,
      order: { name: 'ASC' },
      relations: ['images'],
    });
  }

  async listImageTags(imageId: string) {
    return await this.tagsRepository.find({
      where: { images: { id: imageId } },
    });
  }
}
