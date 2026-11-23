import type { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import Joi from 'joi';

export interface RecipeIngredientInput {
  id: string;
  measure: string;
}

export interface CreateRecipeInput {
  title: string;
  description: string;
  category: string;
  area: string;
  time: string;
  instructions: string;
  ingredients: RecipeIngredientInput[];
}

export const parseRecipeFormData = (req: Request, _res: Response, next: NextFunction): void => {
  if (typeof req.body?.ingredients === 'string') {
    try {
      req.body.ingredients = JSON.parse(req.body.ingredients);
    } catch {
      next(createHttpError(400, 'Field "ingredients" must be a valid JSON array'));
      return;
    }
  }

  next();
};

const recipeIngredientSchema = Joi.object<RecipeIngredientInput>({
  id: Joi.string().trim().min(1).required(),
  measure: Joi.string().trim().min(1).max(50).required(),
});

export const createRecipeSchema = Joi.object<CreateRecipeInput>({
  title: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().min(1).max(200).required(),
  category: Joi.string().trim().min(1).required(),
  area: Joi.string().trim().min(1).required(),
  time: Joi.alternatives()
    .try(
      Joi.number().integer().min(1).max(1440),
      Joi.string()
        .trim()
        .pattern(/^[1-9]\d*$/),
    )
    .custom((value) => String(value))
    .required(),
  instructions: Joi.string().trim().min(1).max(1000).required(),
  ingredients: Joi.array().items(recipeIngredientSchema).min(1).unique('id').required().messages({
    'array.min': 'At least one ingredient is required',
    'array.unique': 'Duplicate ingredients are not allowed',
  }),
});
