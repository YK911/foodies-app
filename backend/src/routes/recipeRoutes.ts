import { Router } from 'express';
import { authenticate } from '../middlewares/authenticate.js';
import { upload } from '../middlewares/upload.js';
import * as controller from '../controllers/recipeController.js';

const router = Router();

router.use(authenticate);
router.post('/', upload.single('thumb'), controller.createRecipe);
router.get('/own', controller.getOwnRecipes);
router.get('/favorite', controller.getFavorites);
router.delete('/:id', controller.deleteRecipe);
router.post('/:id/favorite', controller.addFavorite);
router.delete('/:id/favorite', controller.removeFavorite);

export default router;
