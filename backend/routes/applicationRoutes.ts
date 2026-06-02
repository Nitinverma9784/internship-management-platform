import { Router } from 'express';
import { 
  getApplications, 
  createApplication, 
  updateApplication, 
  uploadResumePdf 
} from '../controllers/applicationController.js';
import { upload } from '../config/multer.js';

const router = Router();

router.get('/', getApplications);
router.post('/', createApplication);
router.put('/:id', updateApplication);
router.post('/upload', upload.single('resume'), uploadResumePdf);

export default router;
