import express from 'express';
import { getActivities } from './activity.controller.js';
import { protect } from '../../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(protect, getActivities);

export default router;
