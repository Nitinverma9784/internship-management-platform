import { Router } from 'express';
import { getInternships, createInternship, deleteInternship } from '../controllers/internshipController.js';

const router = Router();

router.get('/', getInternships);
router.post('/', createInternship);
router.delete('/:id', deleteInternship);

export default router;
