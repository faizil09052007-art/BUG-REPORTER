import express from 'express';
import { getTickets, getTicketById, createTicket, updateTicketStatus } from './ticket.controller.js';
import { protect, authorize } from '../../middleware/auth.js';
import { validateRequest, schemas } from '../../middleware/validator.js';

const router = express.Router();

router.use(protect); // All ticket routes are protected

router.route('/')
  .get(getTickets)
  .post(authorize('admin', 'developer', 'qa'), validateRequest(schemas.createTicket), createTicket);

router.route('/:id')
  .get(getTicketById);

router.route('/:id/status')
  .patch(authorize('admin', 'developer', 'qa'), validateRequest(schemas.updateTicketStatus), updateTicketStatus);

export default router;
