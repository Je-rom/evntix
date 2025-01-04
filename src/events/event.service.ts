import { AppDataSource } from '../data-source';
import { Event } from './event.entity';
import { User } from '../user/user.entity';
import { AppError } from '../shared/utils/response';

export class EventService {
  constructor(private eventRepository = AppDataSource.getRepository(Event)) {}

  //create event
  public createEvent = async (user: User): Promise<void> => {
    try {
      //only event planners should create events
      if (user.role !== 'EVENT_PLANNER') {
        throw new AppError(
          'Only event planners are allowed to create an event',
          400,
        );
      }

      //check if event already exists
      const ifEventExist = await this.eventRepository.findOne({
        where: { title },
      });
      if (ifEventExist) {
        throw new AppError('Event already exists with that title', 400);
      }
    } catch (error) {}
  };
}
