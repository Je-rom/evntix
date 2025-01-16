import { AppDataSource } from '../data-source';
import { Event } from './event.entity';
import { AppError } from '../utils/response';
import { TicketPrice } from '../tickets/tickets.entity';
import { EventStatus, TicketType } from '../enums/enum';
import { plainToInstance } from 'class-transformer';
import { validateEntity } from '../utils/validation';
import { NextFunction } from 'express';

class EventService {
  constructor(
    private eventRepository = AppDataSource.getRepository(Event),
    private ticketPriceRepository = AppDataSource.getRepository(TicketPrice),
  ) {}

  //create event
  // public createEvent = async (
  //   event_data: Partial<Event>,
  //   ticket_price: TicketPrice[],
  //   next: NextFunction,
  // ): Promise<{ event: Event; ticketPrices: TicketPrice[] }> => {
  //   try {
  //     const {
  //       title,
  //       date,
  //       event_image,
  //       capacity,
  //       free_ticket_count,
  //       ...the_rest
  //     } = event_data;

  //     //check if event already exists
  //     const ifEventExist = await this.eventRepository.findOne({
  //       where: { title },
  //       relations: ['ticket_prices'],
  //     });
  //     if (ifEventExist) {
  //       throw new AppError('Event already exists with that title', 400);
  //     }

  //     //check for correct date
  //     if (date) {
  //       const eventDate = new Date(date);
  //       if (eventDate < new Date()) {
  //         throw new AppError('Event date cannot be in the past', 400);
  //       }
  //     }

  //     //check for capactiy
  //     if (capacity && capacity < 1) {
  //       throw new AppError('Event capacity must be at least 1', 400);
  //     }

  //     //check for image size
  //     if (event_image) {
  //       const maxFiles = 3 * 1024 * 1024; //2mb
  //       if (event_image.length > maxFiles) {
  //         throw new AppError('Image size should not be more than 3MB', 400);
  //       }
  //     }

  //     //determine event status based on ticket price availability
  //     let eventStatus = EventStatus.AVAILABLE;
  //     let isFreeEvent = false;

  //     //if no ticket prices are provided, its a free event
  //     if (
  //       !ticket_price ||
  //       ticket_price.length === 0 ||
  //       ticket_price.every((price) => price.price === 0)
  //     ) {
  //       eventStatus = EventStatus.FREE;
  //       isFreeEvent = true;
  //     }

  //     //use plainToInstance to convert the request body to a validated event instance
  //     const eventInstance = plainToInstance(Event, {
  //       ...the_rest,
  //       title,
  //       date,
  //       event_image,
  //       capacity,
  //       status: eventStatus,
  //       free_ticket_count,
  //     });

  //     //validate the newUser instance using utility function
  //     await validateEntity(eventInstance);

  //     //create event
  //     const event = this.eventRepository.create(eventInstance);

  //     const savedTicketPrices: TicketPrice[] = [];

  //     //ticket price should not have a negetive value
  //     if (ticket_price && ticket_price.length > 0) {
  //       for (const price of ticket_price) {
  //         if (price?.price === undefined || price.price < 0) {
  //           throw new AppError(
  //             'Ticket price must be a non-negative value',
  //             400,
  //           );
  //         }

  //         //check for duplicate ticket types
  //         const duplicateType =
  //           ticket_price.filter((tp) => tp.ticket_type === price.ticket_type)
  //             .length > 1;
  //         if (duplicateType) {
  //           throw new AppError(
  //             `Duplicate ticket type ${price.ticket_type} found for the same event`,
  //             400,
  //           );
  //         }

  //         const ticketPriceEntity = await this.ticketPriceRepository.create({
  //           ...price,
  //           event: event,
  //           created_At: new Date(),
  //           updated_At: new Date(),
  //         });
  //         const savedTicketPrice =
  //           await this.ticketPriceRepository.save(ticketPriceEntity);
  //         savedTicketPrices.push(savedTicketPrice);
  //       }
  //     }

  //     //handle free tickets if specified
  //     if (
  //       !isFreeEvent &&
  //       free_ticket_count &&
  //       free_ticket_count >= 2 &&
  //       free_ticket_count <= 20
  //     ) {
  //       //create the free tickets
  //       for (let i = 0; i < free_ticket_count; i++) {
  //         const freeTicket = this.ticketPriceRepository.create({
  //           event: event,
  //           ticket_type: TicketType.FREE_TICKET,
  //           price: 0,
  //           created_At: new Date(),
  //           updated_At: new Date(),
  //         });
  //         const FreeTicket = await this.ticketPriceRepository.save(freeTicket);
  //         savedTicketPrices.push(FreeTicket);
  //       }
  //     }
  //     //save event
  //     const saveEvent = await this.eventRepository.save(event);

  //     return { event: saveEvent, ticketPrices: savedTicketPrices };
  //   } catch (error) {
  //     if (error instanceof AppError) {
  //       next(error);
  //     }
  //     throw new AppError(
  //       'An unexpected error occurred while creating the event',
  //       500,
  //     );
  //   }
  // };
  public createEvent = async (
    event_data: Partial<Event>,
    ticket_price: TicketPrice[],
    next: NextFunction,
  ): Promise<{ event: Event; ticketPrices: TicketPrice[] }> => {
    try {
      const {
        title,
        date,
        event_image,
        capacity,
        free_ticket_count,
        ...the_rest
      } = event_data;

      //check if event already exists
      const ifEventExist = await this.eventRepository.findOne({
        where: { title },
      });
      if (ifEventExist) {
        throw new AppError('Event already exists with that title', 400);
      }

      //check for a valid date
      if (date) {
        const eventDate = new Date(date);
        if (eventDate < new Date()) {
          throw new AppError('Event date cannot be in the past', 400);
        }
      }

      //check capacity
      if (capacity && capacity < 1) {
        throw new AppError('Event capacity must be at least 1', 400);
      }

      //check image size
      if (event_image) {
        const maxFiles = 3 * 1024 * 1024; //3mb
        if (event_image.length > maxFiles) {
          throw new AppError('Image size should not be more than 3MB', 400);
        }
      }

      //determine event status based on ticket price availability
      let eventStatus = EventStatus.AVAILABLE;
      let isFreeEvent = false;

      //if no ticket prices are provided, its a free event
      if (
        !ticket_price ||
        ticket_price.length === 0 ||
        ticket_price.every((price) => price.price === 0)
      ) {
        eventStatus = EventStatus.FREE;
        isFreeEvent = true;
      }

      //plainToInstance to convert the request body to a validated event instance
      const eventInstance = plainToInstance(Event, {
        ...the_rest,
        title,
        date,
        event_image,
        capacity,
        status: eventStatus,
        free_ticket_count, //add free ticket count if provided
      });

      //check the event instance using a utility function
      await validateEntity(eventInstance);

      //create and save the event
      const event = this.eventRepository.create(eventInstance);

      const savedTicketPrices: TicketPrice[] = [];

      //check ticket prices, including free tickets if applicable
      if (ticket_price && ticket_price.length > 0) {
        for (const price of ticket_price) {
          if (price.price === undefined || price.price < 0) {
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
              `Duplicate ticket type ${price.ticket_type} found for the same event`,
              400,
            );
          }

          const ticketPriceEntity = this.ticketPriceRepository.create({
            ...price,
            event: event,
            created_At: new Date(),
            updated_At: new Date(),
          });
          const savedTicketPrice =
            await this.ticketPriceRepository.save(ticketPriceEntity);
          savedTicketPrices.push(savedTicketPrice);
        }
      }

      //handle free tickets if specified
      if (
        !isFreeEvent &&
        free_ticket_count &&
        free_ticket_count >= 2 &&
        free_ticket_count <= 20
      ) {
        //create the free tickets
        for (let i = 0; i < free_ticket_count; i++) {
          const freeTicket = this.ticketPriceRepository.create({
            event: event,
            ticket_type: TicketType.FREE_TICKET,
            price: 0,
            created_At: new Date(),
            updated_At: new Date(),
          });
          const savedFreeTicket =
            await this.ticketPriceRepository.save(freeTicket);
          savedTicketPrices.push(savedFreeTicket);
        }
      }
      const savedEvent = await this.eventRepository.save(event);

      return { event: savedEvent, ticketPrices: savedTicketPrices };
    } catch (error) {
      if (error instanceof AppError) {
        next(error);
      }
      throw new AppError(
        'An unexpected error occurred while creating the event',
        500,
      );
    }
  };

  //update event
  public updateEvent = async (eventData: Partial<Event>) => {
    //check if event exists
    const event = await this.eventRepository.findOne({
      where: { id: eventData.id },
    });
    if (!event) {
      throw new AppError('Event does not exist', 404);
    }
  };
}

export const eventService = new EventService();
