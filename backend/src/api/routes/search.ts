import { Router } from 'express';
import { searchController } from '../controllers/searchController';

const router = Router();

router.post('/search', searchController.handleSearch);

export default router;