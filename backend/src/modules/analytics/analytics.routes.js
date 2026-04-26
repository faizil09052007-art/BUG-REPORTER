import express from 'express';
import { getTicketAnalytics } from './analytics.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.route('/tickets')
  .get(protect, getTicketAnalytics);

export default router;
