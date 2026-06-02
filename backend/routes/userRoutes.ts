import { Router } from 'express';
import { 
  getUsers, 
  updateUser, 
  updateUserRole, 
  createUser, 
  deleteUser 
} from '../controllers/userController.js';

const router = Router();

router.get('/', getUsers);
router.post('/', createUser);
router.put('/:id', updateUser);
router.put('/:id/role', updateUserRole);
router.delete('/:id', deleteUser);

export default router;
