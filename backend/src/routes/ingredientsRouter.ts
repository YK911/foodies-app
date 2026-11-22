import { Router } from 'express';
import { getIngredients } from '../controllers/ingredientsController.js';

const ingredientsRouter = Router();

ingredientsRouter.get('/', getIngredients);

export default ingredientsRouter;
