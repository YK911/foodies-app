import { Router } from 'express';
import { getAreas } from '../controllers/areasController.js';

const areasRouter = Router();

areasRouter.get('/', getAreas);

export default areasRouter;
