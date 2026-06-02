import { Router } from 'express';
import { getMessages, createMessage, markMessageRead } from '../controllers/messageController.js';

const router = Router();

router.get('/', getMessages);
router.post('/', createMessage);
router.put('/:id/read', markMessageRead);

export default router;
