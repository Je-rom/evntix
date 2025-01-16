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
      //get event data and ticket prices from request body
      const {
        title,
        description,
        date,
        location,
        capacity,
        status,
        event_image,
        ticket_prices,
      } = req.body;

      //create event in the service layer
      const newEvent = await this.eventService.createEvent(
        {
          title,
          description,
          date,
          location,
          capacity,
          status,
          event_image,
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
}

export const eventController = new EventController();
