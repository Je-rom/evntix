import { AuthenticatedRequest } from '../interface/interface';
import { eventService } from './event.service';
import { NextFunction, Request, Response } from 'express';

class EventController {
  private eventService = eventService;

  createEvent = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authUser = req as AuthenticatedRequest;
      const {
        title,
        description,
        date,
        location,
        status,
        event_image,
        ticket_prices,
        free_ticket,
        time,
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
          time,
        },
        ticket_prices,
        next,
        authUser,
      );

      //send success response
      res.status(201).json({
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
  ): Promise<void> => {
    try {
      const authUser = req as AuthenticatedRequest;
      const {
        title,
        description,
        date,
        location,
        status,
        event_image,
        ticket_prices,
        free_ticket,
        ticket_count,
        time,
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
          ticket_count,
          time,
        },
        authUser,
        next,
        ticket_prices,
      );

      res.status(200).json({
        status: true,
        message: 'Event updated successfully',
        updatedEvent: updateEvent,
      });
    } catch (error) {
      next(error);
    }
  };

  getEventById = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const id = req.params.id;
      const event = await this.eventService.getEventById(id, next);
      res.status(200).json({
        status: true,
        message: 'Event fetched successfully',
        Event: event,
      });
    } catch (error) {
      next(error);
    }
  };

  getAllEvents = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const allEvents = await this.eventService.getAllEvents(next);
      res.status(200).json({
        status: true,
        message: 'Event fetched successfully',
        Event: allEvents,
      });
    } catch (error) {
      next(error);
    }
  };

  getMyEvents = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const myEvents = await this.eventService.getMyEvents(authReq, next);
      res.status(200).json({
        status: true,
        message: 'Event fetched successfully',
        Event: myEvents,
      });
    } catch (error) {
      next(error);
    }
  };

  createRsvpEvent = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        title,
        date,
        time,
        description,
        location,
        event_image,
        invitees,
        status,
      } = req.body;
      const authUser = req as AuthenticatedRequest;

      const rsvp = await this.eventService.rsvpEvent(
        {
          title,
          date,
          time,
          description,
          location,
          event_image,
          status,
        },
        invitees,
        authUser,
        next,
      );

      res.status(200).json({
        status: true,
        message: 'RSVP sent successfully',
        Event: rsvp,
      });
    } catch (error) {
      next(error);
    }
  };
}

export const eventController = new EventController();
