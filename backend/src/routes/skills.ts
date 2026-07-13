import { Router } from 'express';
import { getAllSkills } from '../controllers/skillController';

const router = Router();

router.get('/', getAllSkills);

export default router;
