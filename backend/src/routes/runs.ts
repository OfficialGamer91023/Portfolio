import { Router } from 'express';
import { getAllRuns } from '../controllers/runController';

const router = Router();

router.get('/', getAllRuns);

export default router;
