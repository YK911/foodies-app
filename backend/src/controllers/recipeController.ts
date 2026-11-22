import { NextFunction, Request, Response } from 'express';
import createHttpError from 'http-errors';
import * as recipeService from '../services/recipeService.js';

const requireUser = (req: Request) => {
  if (!req.user) throw createHttpError(401, 'Not authorized');
  return req.user;
};

const getPagination = (req: Request) => {
  const page = Number(req.query.page || 1);
  const limit = Number(req.query.limit || 12);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw createHttpError(400, 'Invalid pagination parameters');
  }
  return { page, limit };
};

export const createRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = requireUser(req);
    const recipe = await recipeService.createRecipe(user.id, { ...req.body, thumb: req.file });
    res.status(201).json(recipe);
  } catch (error) {
    next(error);
  }
};

export const deleteRecipe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = requireUser(req);
    await recipeService.deleteOwnRecipe(user.id, req.params.id);
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getOwnRecipes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = requireUser(req);
    const { page, limit } = getPagination(req);
    res.status(200).json(await recipeService.getOwnRecipes(user.id, page, limit));
  } catch (error) {
    next(error);
  }
};

export const addFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = requireUser(req);
    await recipeService.addFavorite(user.id, req.params.id);
    res.status(201).json({ message: 'Recipe added to favorites' });
  } catch (error) {
    next(error);
  }
};

export const removeFavorite = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = requireUser(req);
    await recipeService.removeFavorite(user.id, req.params.id);
    res.status(200).json({ message: 'Recipe removed from favorites' });
  } catch (error) {
    next(error);
  }
};

export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = requireUser(req);
    const { page, limit } = getPagination(req);
    res.status(200).json(await recipeService.getFavorites(user.id, page, limit));
  } catch (error) {
    next(error);
  }
};
