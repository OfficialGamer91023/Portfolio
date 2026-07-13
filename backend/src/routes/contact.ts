import { Router } from 'express';
import { createContactSubmission } from '../controllers/contactController';

const router = Router();

router.post('/', createContactSubmission);

export default router;
