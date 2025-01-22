import { Router } from 'express';
import { eventController } from './event.controller';
import { JwtAuthGuard, RoleGuard } from '../auth/guards';
import { Role } from '../enums/enum';

export const eventRouter = Router();

eventRouter
  .route('/myevents')
  .get(
    JwtAuthGuard,
    RoleGuard([Role.EVENT_PLANNER]),
    eventController.getMyEvents,
  );

eventRouter
  .route('/rsvp')
  .post(
    JwtAuthGuard,
    RoleGuard([Role.EVENT_PLANNER]),
    eventController.createRsvpEvent,
  );

eventRouter
  .route('/')
  .post(
    JwtAuthGuard,
    RoleGuard([Role.EVENT_PLANNER]),
    eventController.createEvent,
  );

eventRouter.route('/').get(JwtAuthGuard, eventController.getAllEvents);

eventRouter
  .route('/:id')
  .patch(
    JwtAuthGuard,
    RoleGuard([Role.EVENT_PLANNER]),
    eventController.updateEvent,
  );

eventRouter.route('/:id').get(JwtAuthGuard, eventController.getEventById);
