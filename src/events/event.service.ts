import { AppDataSource } from '../data-source';
import { Event } from './event.entity';
import { User } from '../user/user.entity';
import { AppError } from '../utils/response';

export class EventService {
  constructor(private eventRepository = AppDataSource.getRepository(Event)) {}

  //create event
  public createEvent = async (
    user: User,
    eventData: Partial<Event>,
  ): Promise<void> => {
    try {
      const { title, date, event_image } = eventData;

      //check if event already exists
      const ifEventExist = await this.eventRepository.findOne({
        where: { title },
      });
      if (ifEventExist) {
        throw new AppError('Event already exists with that title', 400);
      }

      //check for correct date
      const eventDate = date ? new Date(date) : undefined;
      if (eventDate && eventData < new Date()) {
        throw new AppError('Event date cannot be in the past', 400);
      }

      //check for image size
      if (event_image) {
        const maxFiles = 3 * 1024 * 1024; //2mb
        if (event_image.length > maxFiles) {
          throw new AppError('Image size should not be more than 3MB', 400);
        }
      }
    } catch (error) {}
  };
}
