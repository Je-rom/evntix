import { eventService } from './event.service';
import { NextFunction, Request, Response } from 'express';

class EventController {
  private eventService = eventService;

  public createEvent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const {
        title,
        description,
        date,
        location,
        status,
        event_image,
        ticket_prices,
        free_ticket,
      } = req.body;

      //create event in the service layer
      const newEvent = await this.eventService.createEvent(
        {
          title,
          description,
          date,
          location,
          status,
          event_image,
          free_ticket,
        },
        ticket_prices,
        next,
      );

      //send success response
      return res.status(201).json({
        status: true,
        message: 'Event created successfully',
        event: newEvent,
      });
    } catch (error) {
      next(error);
    }
  };

  updateEvent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<any> => {
    try {
      const {
        title,
        description,
        date,
        location,
        status,
        event_image,
        ticket_prices,
        free_ticket,
      } = req.body;

      const event_id = req.params.id;

      //update event
      const updateEvent = await this.eventService.updateEvent(
        event_id,
        {
          title,
          description,
          date,
          location,
          status,
          event_image,
          ticket_prices,
          free_ticket,
        },
        ticket_prices,
        next,
      );

      return res.status(200).json({
        status: true,
        message: 'Event updated successfully',
        updatedEvent: updateEvent,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const eventController = new EventController();
