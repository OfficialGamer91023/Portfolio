import { Router } from 'express';
import { getAllContributions } from '../controllers/contributionController';

const router = Router();

router.get('/', getAllContributions);

export default router;
