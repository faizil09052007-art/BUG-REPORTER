import express from 'express';
import { protect } from '../../middleware/auth.js';
import { validateRequest, schemas } from '../../middleware/validator.js';
import { registerUser, loginUser, refresh, logoutUser, changePassword, updateNotifications, getMe } from './user.controller.js';

const router = express.Router();

router.post('/register', validateRequest(schemas.registerUser), registerUser);
router.post('/login', validateRequest(schemas.loginUser), loginUser);
router.post('/refresh', refresh);
router.post('/logout', protect, logoutUser);

router.get('/me', protect, getMe);
router.patch('/password', protect, changePassword);
router.patch('/notifications', protect, updateNotifications);

export default router;
