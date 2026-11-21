import { Router } from 'express';
import {
  getRecipesController,
  getPopularRecipesController,
  getRecipeByIdController,
} from '../controllers/recipesController.js';

const recipesRouter = Router();

recipesRouter.get('/', getRecipesController);
recipesRouter.get('/popular', getPopularRecipesController);
recipesRouter.get('/:id', getRecipeByIdController);

export default recipesRouter;
