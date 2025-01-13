import { Router } from 'express';
import { eventController } from './event.controller';
import { JwtAuthGuard, RoleGuard } from '../auth/guards';
import { Role } from '../enums/enum';

export const eventRouter = Router();

eventRouter
  .route('/')
  .post(
    JwtAuthGuard,
    RoleGuard([Role.EVENT_PLANNER]),
    eventController.createEvent,
  );
