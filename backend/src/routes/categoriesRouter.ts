import { Router } from 'express';
import { getCategories } from '../controllers/categoriesController.js';

const categoriesRouter = Router();

categoriesRouter.get('/', getCategories);

export default categoriesRouter;
