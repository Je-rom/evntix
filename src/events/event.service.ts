import { AppDataSource } from '../data-source';
import { Event } from './event.entity';
import { AppError } from '../utils/response';
import { TicketPrice } from '../tickets/tickets.entity';
import { EventStatus, TicketType } from '../enums/enum';
import { plainToInstance } from 'class-transformer';
import { validateEntity } from '../utils/validation';
import { NextFunction } from 'express';
import { EntityManager } from 'typeorm';
class EventService {
  // constructor(private eventRepository = AppDataSource.getRepository(Event)) {
  // private ticketPriceRepository = AppDataSource.getRepository(TicketPrice),
  // }

  public createEvent = async (
    event_data: Partial<Event>,
    ticket_price: TicketPrice[],
    next: NextFunction,
  ): Promise<{ event: Event; ticketPrices: TicketPrice[] }> => {
    return AppDataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const {
            title,
            date,
            event_image,
            free_ticket,
            ticket_count,
            ticket_availability_end_date,
            ...the_rest
          } = event_data;

          //check if event already exists
          const ifEventExist = await transactionalEntityManager.findOne(Event, {
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

          //if no ticket prices are provided then its a free event
          if (
            !ticket_price ||
            ticket_price.length === 0 ||
            ticket_price.every((price) => price.price === 0)
          ) {
            eventStatus = EventStatus.FREE;
            isFreeEvent = true;
          }

          //convert the request body to a validated event instance
          const eventInstance = plainToInstance(Event, {
            ...the_rest,
            title,
            date,
            event_image,
            status: eventStatus,
            free_ticket, //add free ticket count if provided
          });
          console.log('free_ticket:', free_ticket);

          //validate the event instance
          await validateEntity(eventInstance);

          //create the event
          const event = transactionalEntityManager.create(Event, eventInstance);
          //save the event
          const savedEvent = await transactionalEntityManager.save(event);

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
                ticket_price.filter(
                  (tp) => tp.ticket_type === price.ticket_type,
                ).length > 1;
              if (duplicateType) {
                throw new AppError(
                  `Duplicate ticket type ${price.ticket_type} found for the same event`,
                  400,
                );
              }

              const ticketPriceEntity = transactionalEntityManager.create(
                TicketPrice,
                {
                  ...price,
                  event: savedEvent,
                  created_At: new Date(),
                  updated_At: new Date(),
                },
              );
              const ticketPrice =
                await transactionalEntityManager.save(ticketPriceEntity);
              savedTicketPrices.push(ticketPrice);
            }
          }

          //handle free tickets if specified
          if (!isFreeEvent && free_ticket) {
            //create the free tickets
            for (let i = 0; i < free_ticket; i++) {
              const freeTicket = transactionalEntityManager.create(
                TicketPrice,
                {
                  event: savedEvent,
                  ticket_type: TicketType.FREE_TICKET,
                  price: 0,
                  created_At: new Date(),
                  updated_At: new Date(),
                },
              );
              const savedFreeTicket =
                await transactionalEntityManager.save(freeTicket);
              savedTicketPrices.push(savedFreeTicket);
            }
          }

          return { event: event, ticketPrices: savedTicketPrices };
        } catch (error) {
          console.error('Error during event creation:', error);
          if (error instanceof AppError) {
            next(error);
          }
          throw new AppError(
            'An unexpected error occurred while creating the event',
            500,
          );
        }
      },
    );
  };

  public updateEvent = async (
    event_id: string,
    eventData: Partial<Event>,
    ticket_price: TicketPrice[],
    next: NextFunction,
  ): Promise<{ event: Event; ticketPrices: TicketPrice[] }> => {
    return AppDataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const {
            title,
            date,
            event_image,
            free_ticket,
            ticket_count,
            ticket_availability_end_date,
            ...the_rest
          } = eventData;

          //check if event with id exists
          const existingEvent = await transactionalEntityManager.findOne(
            Event,
            {
              where: { id: event_id },
            },
          );
          if (!existingEvent) {
            throw new AppError('Event not found', 404);
          }

          //check if title has been changed
          if (title && title !== existingEvent.title) {
            const eventTitle = await transactionalEntityManager.findOne(Event, {
              where: { title },
            });
            if (eventTitle) {
              throw new AppError('Event already exist with that title', 400);
            }
          }

          if (date) {
            const eventDate = new Date(date);
            if (eventDate < new Date()) {
              throw new AppError('Event date cannot be in the past', 400);
            }
          }

          if (event_image) {
            const maxFiles = 3 * 1024 * 1024;
            if (event_image.length > maxFiles) {
              throw new AppError('Image size should not be more than 3MB', 400);
            }
          }

          let eventStatus = existingEvent.status;
          let isFreeEvent = false;

          if (
            !ticket_price ||
            ticket_price.length === 0 ||
            ticket_price.every((price) => price.price === 0)
          ) {
            eventStatus = EventStatus.FREE;
            isFreeEvent = true;
          } else {
            eventStatus = EventStatus.AVAILABLE;
          }

          //update event instance
          const updateInstance = plainToInstance(Event, {
            ...the_rest,
            title: title || existingEvent.title,
            date: date || existingEvent.date,
            event_image: event_image || existingEvent.event_image,
            free_ticket,
            ticket_count,
            ticket_availability_end_date,
            status: eventStatus,
          });

          await validateEntity(updateInstance);
          const updatedEvent = await transactionalEntityManager.merge(
            Event,
            updateInstance,
            existingEvent,
          );

          const updatedTicketPrices: TicketPrice[] = [];

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
                ticket_price.filter(
                  (tp) => tp.ticket_type === price.ticket_type,
                ).length > 1;
              if (duplicateType) {
                throw new AppError(
                  `Duplicate ticket type ${price.ticket_type} found for the same event`,
                  400,
                );
              }
              const ticketPriceEntity = transactionalEntityManager.create(
                TicketPrice,
                {
                  ...price,
                  event: updatedEvent,
                  created_At: new Date(),
                  updated_At: new Date(),
                },
              );
              const ticketPrice =
                await transactionalEntityManager.save(ticketPriceEntity);
              updatedTicketPrices.push(ticketPrice);
            }
          }

          if (!isFreeEvent && free_ticket) {
            //create the free tickets if they are needed
            for (let i = 0; i < free_ticket; i++) {
              const freeTicket = transactionalEntityManager.create(
                TicketPrice,
                {
                  event: updatedEvent,
                  ticket_type: TicketType.FREE_TICKET,
                  price: 0,
                  created_At: new Date(),
                  updated_At: new Date(),
                },
              );
              const savedFreeTicket =
                await transactionalEntityManager.save(freeTicket);
              updatedTicketPrices.push(savedFreeTicket);
            }
          }

          return { event: updatedEvent, ticketPrices: updatedTicketPrices };
        } catch (error) {
          console.error('Error during event updating:', error);
          if (error instanceof AppError) {
            next(error);
          }
          throw new AppError(
            'An unexpected error occurred while updating the event',
            500,
          );
        }
      },
    );
  };
}

export const eventService = new EventService();
