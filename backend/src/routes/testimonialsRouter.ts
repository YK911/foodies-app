import { Router } from 'express';
import { getTestimonials } from '../controllers/testimonialsController.js';

const testimonialsRouter = Router();

testimonialsRouter.get('/', getTestimonials);

export default testimonialsRouter;
