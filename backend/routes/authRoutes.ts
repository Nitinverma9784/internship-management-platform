import { Router } from 'express';
import { register, login, getMe, simulate } from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/simulate', simulate);
router.get('/me', authMiddleware, getMe);

export default router;
