import { AppDataSource } from '../data-source';
import { Event } from './event.entity';
import { AppError } from '../utils/response';
import { TicketPrice } from '../tickets/tickets.entity';
import { EventStatus } from '../enums/enum';
import { plainToInstance } from 'class-transformer';
import { validateEntity } from '../utils/validation';

class EventService {
  constructor(
    private eventRepository = AppDataSource.getRepository(Event),
    private ticketPriceRepository = AppDataSource.getRepository(TicketPrice),
  ) {}

  //create event
  public createEvent = async (
    event_data: Partial<Event>,
    ticket_price: TicketPrice[],
  ): Promise<Event> => {
    try {
      const { title, date, event_image, capacity, ...the_rest } = event_data;

      //check if event already exists
      const ifEventExist = await this.eventRepository.findOne({
        where: { title },
      });
      if (ifEventExist) {
        throw new AppError('Event already exists with that title', 400);
      }

      //check for correct date
      if (date) {
        const eventDate = new Date(date);
        if (eventDate < new Date()) {
          throw new AppError('Event date cannot be in the past', 400);
        }
      }

      //check for capactiy
      if (capacity && capacity < 1) {
        throw new AppError('Event capacity must be at least 1', 400);
      }

      //check for image size
      if (event_image) {
        const maxFiles = 3 * 1024 * 1024; //2mb
        if (event_image.length > maxFiles) {
          throw new AppError('Image size should not be more than 3MB', 400);
        }
      }

      //use plainToInstance to convert the request body to a validated Event instance
      const eventInstance = plainToInstance(Event, {
        ...the_rest,
        title,
        date,
        event_image,
        capacity,
        status: EventStatus.AVAILABLE,
      });

      //validate the newUser instance using utility function
      await validateEntity(eventInstance);

      //create event
      const event = this.eventRepository.create(eventInstance);
      //save event
      const saveEvent = await this.eventRepository.save(event);

      //ticket price should not have a negetive value
      if (ticket_price && ticket_price.length > 1) {
        for (const price of ticket_price) {
          if (price.price < 0) {
            throw new AppError(
              'Ticket price must be a non-negative value',
              400,
            );
          }
          //check for duplicate ticket types
          const duplicateType =
            ticket_price.filter((tp) => tp.ticket_type === price.ticket_type)
              .length > 1;
          if (duplicateType) {
            throw new AppError(
              `Duplicate ticket type "${price.ticket_type}" found for the same event`,
              400,
            );
          }

          const ticketPriceEntity = await this.ticketPriceRepository.create({
            ...price,
            event: saveEvent,
            created_At: new Date(),
            updated_At: new Date(),
          });
          await this.ticketPriceRepository.save(ticketPriceEntity);
        }
      }

      return saveEvent;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError(
        'An unexpected error occurred while creating the event',
        500,
      );
    }
  };
}

export const eventService = new EventService();
