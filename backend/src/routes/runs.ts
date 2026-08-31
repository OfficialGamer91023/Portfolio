import { Router } from 'express';
import { getAllRuns, syncRuns } from '../controllers/runController';

const router = Router();

router.get('/', getAllRuns);
router.post('/sync', syncRuns);

export default router;
