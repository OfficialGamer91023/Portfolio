import { Router } from 'express';
import { getAllExperience } from '../controllers/experienceController';

const router = Router();

router.get('/', getAllExperience);

export default router;
