import {
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { Rating } from '../rating/rating.entity';
import { Image } from './image.entity';

@EventSubscriber()
export class RatingSubscriber implements EntitySubscriberInterface<Rating> {
  listenTo() {
    return Rating;
  }

  async afterInsert(event: InsertEvent<Rating>): Promise<void> {
    const { entity, manager } = event;

    const { sum } = await manager
      .getRepository(Rating)
      .createQueryBuilder()
      .select('SUM(Rating.rating)/COUNT(Rating.rating)', 'sum')
      .where('"imageId" = :imageId', { imageId: entity.imageId })
      .getRawOne();

    await manager.getRepository(Image).update(
      {
        id: entity.imageId,
      },
      {
        rate: Number(sum),
      },
    );
  }

  async afterUpdate(event: UpdateEvent<Rating>): Promise<void> {
    const { entity, manager, updatedColumns } = event;

    if (!entity) return;
    if (!updatedColumns.length) return;

    const { sum } = await manager
      .getRepository(Rating)
      .createQueryBuilder()
      .select('SUM(Rating.rating)/COUNT(Rating.rating)', 'sum')
      .where('"imageId" = :imageId', { imageId: entity.imageId })
      .getRawOne();

    await manager.getRepository(Image).update(
      {
        id: entity.imageId,
      },
      {
        rate: Number(sum),
      },
    );
  }
}
