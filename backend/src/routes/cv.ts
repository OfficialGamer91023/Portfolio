import { Router } from 'express';
import { downloadCV } from '../controllers/cvController';

const router = Router();

router.get('/', downloadCV);

export default router;
