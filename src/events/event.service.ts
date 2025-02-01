import { AppDataSource } from '../data-source';
import { Event } from './event.entity';
import { AppError } from '../utils/response';
import { TicketPrice } from '../tickets/tickets.entity';
import { EventStatus, TicketType } from '../enums/enum';
import { plainToInstance } from 'class-transformer';
import { validateEntity } from '../utils/validation';
import { NextFunction } from 'express';
import { EntityManager } from 'typeorm';
import { AuthenticatedRequest } from '../interface/interface';
import { NotificationService } from '../notifications/notification.service';
import path from 'path';
import fs from 'fs';
class EventService {
  constructor(
    private eventRepository = AppDataSource.getRepository(Event),
    private notification = new NotificationService(),
  ) {}

  public createEvent = async (
    event_data: Partial<Event>,
    ticket_price: TicketPrice[],
    next: NextFunction,
    req: AuthenticatedRequest,
  ): Promise<{ event: Event; ticketPrices: TicketPrice[] }> => {
    return AppDataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const authenticatedUserId = req.user?.id;
          if (!authenticatedUserId) {
            throw new AppError('User is not authenticated', 401);
          }
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
            user: { id: authenticatedUserId },
          });

          //validate the event instance
          await validateEntity(eventInstance);

          //create and save the event
          const event = transactionalEntityManager.create(Event, eventInstance);
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
    req: AuthenticatedRequest,
    next: NextFunction,
    ticket_prices?: TicketPrice[],
  ): Promise<{ event: Event; ticketPrices: TicketPrice[] }> => {
    return AppDataSource.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          const authenticatedUserId = req.user?.id;
          if (!authenticatedUserId) {
            throw new AppError('User is not authenticated', 401);
          }

          const existingEvent = await transactionalEntityManager.findOne(
            Event,
            {
              where: { id: event_id },
              relations: { ticket_prices: true, user: true },
            },
          );
          if (!existingEvent) {
            throw new AppError('Event not found', 404);
          }

          //check if the event belongs to the user
          if (existingEvent.user.id !== authenticatedUserId) {
            throw new AppError(
              'Unauthorized access to the event, you can only update your own event',
              403,
            );
          }

          if (eventData.date) {
            const eventDate = new Date(eventData.date);
            if (eventDate < new Date()) {
              throw new AppError('Event date cannot be in the past', 400);
            }
          }

          //update event with new data
          transactionalEntityManager.merge(Event, existingEvent, {
            ...eventData,
            title: eventData.title || existingEvent.title,
            date: eventData.date || existingEvent.date,
            event_image: eventData.event_image || existingEvent.event_image,
            time: eventData.time || existingEvent.time,
            status: eventData.status || existingEvent.status,
          });

          await transactionalEntityManager.save(Event, existingEvent);

          //array to store updated ticket prices
          const updatedTicketPrices: TicketPrice[] = [];

          if (Array.isArray(ticket_prices) && ticket_prices.length > 0) {
            for (const price of ticket_prices) {
              if (price.id) {
                const existingPrice = await transactionalEntityManager.findOne(
                  TicketPrice,
                  { where: { id: price.id } },
                );

                if (existingPrice) {
                  transactionalEntityManager.merge(TicketPrice, existingPrice, {
                    ...price,
                    event: existingEvent,
                  });
                  await transactionalEntityManager.save(
                    TicketPrice,
                    existingPrice,
                  );
                  updatedTicketPrices.push(existingPrice);
                }
              } else {
                //create new ticket price
                const newTicketPrice = transactionalEntityManager.create(
                  TicketPrice,
                  { ...price, event: existingEvent },
                );
                const savedTicketPrice = await transactionalEntityManager.save(
                  TicketPrice,
                  newTicketPrice,
                );
                updatedTicketPrices.push(savedTicketPrice);
              }
            }
          }

          return { event: existingEvent, ticketPrices: updatedTicketPrices };
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

  public getEventById = async (
    event_id: string,
    next: NextFunction,
  ): Promise<Event> => {
    try {
      const existingEvent = await this.eventRepository.findOne({
        where: { id: event_id },
        relations: { ticket_prices: true },
      });
      if (!existingEvent) {
        throw new AppError('Event not found', 404);
      }
      return existingEvent;
    } catch (error) {
      console.error('Error during getting event by ID:', error);
      if (error instanceof AppError) {
        next(error);
      }
      throw new AppError(
        'An unexpected error occurred while getting event by ID',
        500,
      );
    }
  };

  public getAllEvents = async (next: NextFunction): Promise<Event[]> => {
    try {
      const allEvents = await this.eventRepository.find({
        relations: { ticket_prices: true },
      });
      return allEvents;
    } catch (error) {
      console.error('Error during getting all events:', error);
      if (error instanceof AppError) {
        next(error);
      }
      throw new AppError(
        'An unexpected error occurred while getting all events',
        500,
      );
    }
  };

  public getMyEvents = async (
    req: AuthenticatedRequest,
    next: NextFunction,
  ): Promise<Event[]> => {
    try {
      const authenticatedUserId = req.user?.id;
      if (!authenticatedUserId) {
        throw new AppError('User is not authenticated', 401);
      }

      const myEvents = await this.eventRepository.find({
        where: { user: { id: authenticatedUserId } },
        relations: { ticket_prices: true },
      });
      if (!myEvents || myEvents.length === 0) {
        throw new AppError('No events found for this user', 404);
      }
      return myEvents;
    } catch (error) {
      console.error('Error during getting your events:', error);
      if (error instanceof AppError) {
        next(error);
      }
      throw new AppError(
        'An unexpected error occurred while getting all events',
        500,
      );
    }
  };

  public rsvpEvent = async (
    event_data: Partial<Event>,
    invitees: string[],
    req: AuthenticatedRequest,
    next: NextFunction,
  ): Promise<Event> => {
    try {
      const authenticatedUserId = req.user?.id;
      if (!authenticatedUserId) {
        throw new AppError('User is not authenticated', 401);
      }
      const { title, date, time, description, location, event_image, status } =
        event_data;

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

      if (event_image) {
        const maxFiles = 3 * 1024 * 1024;
        if (event_image.length > maxFiles) {
          throw new AppError('Image size should not be more than 3MB', 400);
        }
      }

      const eventInstance = plainToInstance(Event, {
        title,
        date,
        event_image,
        time,
        description,
        location,
        status,
        user: { id: authenticatedUserId },
      });

      await validateEntity(eventInstance);

      //create and save the event
      const event = transactionalEntityManager.create(Event, eventInstance);
      const savedEvent = await transactionalEntityManager.save(event);

      if (invitees && invitees.length > 0) {
        const rsvpDetails = {
          title: savedEvent.title,
          description: savedEvent.description,
          date: savedEvent.date,
          time: savedEvent.time,
          location: savedEvent.location,
          event_image: savedEvent.event_image,
          link: `http://localhost:3000/rsvp?eventId=${savedEvent.id}`,
        };

        //read the html template
        const templatePath = path.join(
          __dirname,
          '..',
          'templates',
          'rsvp.html',
        );
        const template = fs.readFileSync(templatePath, 'utf-8');
        const htmlContent = template
          .replace(/\${event\.title}/g, rsvpDetails.title)
          .replace(/\${event\.description}/g, rsvpDetails.description)
          .replace(
            /\${event\.date}/g,
            rsvpDetails.date
              ? new Date(rsvpDetails.date).toLocaleDateString()
              : '',
          )
          .replace(/\${event\.time}/g, rsvpDetails.time)
          .replace(/\${event\.location}/g, rsvpDetails.location)
          .replace(
            /\${event\.event_image}/g,
            rsvpDetails.event_image ? rsvpDetails.event_image.toString() : '',
          )
          .replace(/\${rsvpLink}/g, rsvpDetails.link);

        //send emails concurrently
        await Promise.all(
          invitees.map(async (email) => {
            try {
              const personalizedHtmlContent = htmlContent.replace(
                /\${recipient_email}/g,
                email,
              );
              await this.notification.sendEmail(
                email,
                `${rsvpDetails.title} INVITATION`,
                `You're Invited to ${rsvpDetails.title}`,
                personalizedHtmlContent,
              );
            } catch (error) {
              console.error(`Failed to send email to ${email}:`, error);
              next(error);
            }
          }),
        );
      }

      return savedEvent;
    } catch (error) {
      console.error('RSVP event error:', error);
      if (error instanceof AppError) {
        next(error);
      }
      throw new AppError(
        'An unexpected error occurred while creating RSVP event',
        500,
      );
    }
  };
}

export const eventService = new EventService();
