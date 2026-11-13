import * as Yup from 'yup';
import { ACCEPTED_IMAGE_TYPES } from './PhotoField';

export const DESCRIPTION_MAX_LENGTH = 200;
export const INSTRUCTIONS_MAX_LENGTH = 1000;
export const MIN_COOKING_TIME = 1;
export const DEFAULT_COOKING_TIME = 10;

export interface RecipeIngredientValue {
  id: string;
  measure: string;
}

export interface AddRecipeValues {
  thumb: File | null;
  title: string;
  description: string;
  category: string;
  area: string;
  time: number;
  ingredients: RecipeIngredientValue[];
  instructions: string;
}

export const initialValues: AddRecipeValues = {
  thumb: null,
  title: '',
  description: '',
  category: '',
  area: '',
  time: DEFAULT_COOKING_TIME,
  ingredients: [],
  instructions: '',
};

export const validationSchema = Yup.object({
  thumb: Yup.mixed<File>()
    .nullable()
    .required('Upload a photo of the dish')
    .test(
      'file-type',
      'Use a JPG, PNG or WEBP image',
      (file) => !file || ACCEPTED_IMAGE_TYPES.includes(file.type),
    ),
  title: Yup.string().trim().required('Enter the name of the recipe'),
  description: Yup.string()
    .trim()
    .required('Enter a description of the dish')
    .max(DESCRIPTION_MAX_LENGTH, `Keep the description under ${DESCRIPTION_MAX_LENGTH} characters`),
  category: Yup.string().required('Select a category'),
  area: Yup.string().required('Select an area'),
  time: Yup.number()
    .required('Set the cooking time')
    .integer('Cooking time must be a whole number of minutes')
    .min(MIN_COOKING_TIME, `Cooking time must be at least ${MIN_COOKING_TIME} minute`),
  ingredients: Yup.array()
    .of(
      Yup.object({
        id: Yup.string().required(),
        measure: Yup.string().trim().required(),
      }),
    )
    .min(1, 'Add at least one ingredient'),
  instructions: Yup.string()
    .trim()
    .required('Enter the recipe preparation')
    .max(
      INSTRUCTIONS_MAX_LENGTH,
      `Keep the preparation under ${INSTRUCTIONS_MAX_LENGTH} characters`,
    ),
});
