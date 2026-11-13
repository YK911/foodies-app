import { useEffect, useMemo, useState } from 'react';
import { Form, Formik } from 'formik';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchLookups } from '../../redux/meta/operations';
import { createRecipe } from '../../services/recipesApi';
import { getErrorMessage } from '../../utils/getErrorMessage';
import SelectField, { type SelectOption } from '../SelectField/SelectField';
import PlusIcon from '../../assets/icons/plus-small.svg?react';
import CloseIcon from '../../assets/icons/x.svg?react';
import TrashIcon from '../../assets/icons/trash.svg?react';
import PhotoField from './PhotoField';
import CountedTextarea from './CountedTextarea';
import TimeCounter from './TimeCounter';
import {
  DEFAULT_COOKING_TIME,
  DESCRIPTION_MAX_LENGTH,
  INSTRUCTIONS_MAX_LENGTH,
  MIN_COOKING_TIME,
  initialValues,
  validationSchema,
  type AddRecipeValues,
} from './validationSchema';
import css from './AddRecipeForm.module.css';

const MEASURE_MAX_LENGTH = 50;

interface DraftErrors {
  ingredient?: string;
  measure?: string;
}

const toOptions = (items: { name: string }[]): SelectOption[] =>
  items.map(({ name }) => ({ value: name, label: name }));

export const AddRecipeForm = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    categories,
    areas,
    ingredients,
    error: lookupsError,
  } = useAppSelector((state) => state.meta);

  // The ingredient picker and quantity are a draft; only the list below them is submitted.
  const [draftIngredientId, setDraftIngredientId] = useState('');
  const [draftMeasure, setDraftMeasure] = useState('');
  const [draftErrors, setDraftErrors] = useState<DraftErrors>({});

  useEffect(() => {
    dispatch(fetchLookups());
  }, [dispatch]);

  useEffect(() => {
    if (lookupsError) {
      toast.error(`Could not load categories, areas or ingredients. ${lookupsError}`, {
        id: 'lookups-error',
      });
    }
  }, [lookupsError]);

  const categoryOptions = useMemo(() => toOptions(categories), [categories]);
  const areaOptions = useMemo(() => toOptions(areas), [areas]);
  const ingredientOptions = useMemo(
    () => ingredients.map(({ id, name }) => ({ value: id, label: name })),
    [ingredients],
  );
  const ingredientsById = useMemo(
    () => new Map(ingredients.map((ingredient) => [ingredient.id, ingredient])),
    [ingredients],
  );

  const resetDraft = () => {
    setDraftIngredientId('');
    setDraftMeasure('');
    setDraftErrors({});
  };

  const handleSubmit = async (values: AddRecipeValues) => {
    if (!values.thumb) {
      return;
    }

    try {
      const recipeId = await createRecipe({ ...values, thumb: values.thumb });
      toast.success('Your recipe is published');
      navigate(`/recipe/${recipeId}`);
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        submitCount,
        isSubmitting,
        getFieldProps,
        setFieldValue,
        setFieldTouched,
        resetForm,
      }) => {
        const errorFor = (name: keyof AddRecipeValues): string | undefined => {
          const error = errors[name];
          const isTouched = Boolean(touched[name]) || submitCount > 0;

          return isTouched && typeof error === 'string' ? error : undefined;
        };

        const describedBy = (name: string, error?: string) => (error ? `${name}-error` : undefined);

        const renderError = (name: string, error?: string) =>
          error ? (
            <p id={`${name}-error`} className={css.error}>
              {error}
            </p>
          ) : null;

        const selectChoice = (name: 'category' | 'area', value: string) => {
          setFieldValue(name, value);
          setFieldTouched(name, true, false);
        };

        const addIngredient = () => {
          const measure = draftMeasure.trim();
          const nextErrors: DraftErrors = {
            ingredient: draftIngredientId ? undefined : 'Select an ingredient',
            measure: measure ? undefined : 'Enter the quantity',
          };

          setDraftErrors(nextErrors);

          if (nextErrors.ingredient || nextErrors.measure) {
            return;
          }

          // Each ingredient can appear once per recipe, so a repeat updates its quantity.
          const isAdded = values.ingredients.some(({ id }) => id === draftIngredientId);
          const nextIngredients = isAdded
            ? values.ingredients.map((item) =>
                item.id === draftIngredientId ? { ...item, measure } : item,
              )
            : [...values.ingredients, { id: draftIngredientId, measure }];

          setFieldValue('ingredients', nextIngredients);
          resetDraft();
        };

        const removeIngredient = (ingredientId: string) => {
          setFieldValue(
            'ingredients',
            values.ingredients.filter(({ id }) => id !== ingredientId),
          );
        };

        const clearForm = () => {
          resetForm();
          resetDraft();
        };

        const titleError = errorFor('title');
        const descriptionError = errorFor('description');
        const categoryError = errorFor('category');
        const areaError = errorFor('area');
        const timeError = errorFor('time');
        const ingredientsError = errorFor('ingredients');
        const instructionsError = errorFor('instructions');

        return (
          <Form className={css.form} noValidate>
            <PhotoField
              id="thumb"
              file={values.thumb}
              error={errorFor('thumb')}
              onChange={(file) => {
                setFieldValue('thumb', file);
                setFieldTouched('thumb', true, false);
              }}
            />

            <div className={css.fieldsColumn}>
              <div className={css.ingredientsPart}>
                <div className={css.details}>
                  <div className={css.nameBlock}>
                    <div className={css.controlWrap}>
                      <input
                        {...getFieldProps('title')}
                        id="title"
                        type="text"
                        placeholder="The name of the recipe"
                        aria-label="The name of the recipe"
                        aria-invalid={Boolean(titleError) || undefined}
                        aria-describedby={describedBy('title', titleError)}
                        className={clsx(css.titleInput, titleError && css.titleInputInvalid)}
                      />
                      {renderError('title', titleError)}
                    </div>

                    <div className={css.controlWrap}>
                      <CountedTextarea
                        {...getFieldProps('description')}
                        id="description"
                        maxLength={DESCRIPTION_MAX_LENGTH}
                        placeholder="Enter a description of the dish"
                        aria-label="Description of the dish"
                        aria-describedby={describedBy('description', descriptionError)}
                        invalid={Boolean(descriptionError)}
                      />
                      {renderError('description', descriptionError)}
                    </div>
                  </div>

                  <div className={css.selects}>
                    <div className={css.categoryTimeRow}>
                      <div className={clsx(css.field, css.categoryField)}>
                        <span id="category-label" className={css.label}>
                          Category
                        </span>
                        <div className={css.controlWrap}>
                          <SelectField
                            id="category"
                            options={categoryOptions}
                            value={values.category}
                            placeholder="Select a category"
                            labelledBy="category-label"
                            invalid={Boolean(categoryError)}
                            describedBy={describedBy('category', categoryError)}
                            onChange={(value) => selectChoice('category', value)}
                            onBlur={() => setFieldTouched('category', true)}
                          />
                          {renderError('category', categoryError)}
                        </div>
                      </div>

                      <div className={css.field}>
                        <span id="time-label" className={css.label}>
                          Cooking time
                        </span>
                        <div className={css.controlWrap}>
                          <TimeCounter
                            value={values.time}
                            min={MIN_COOKING_TIME}
                            isDefault={!touched.time && values.time === DEFAULT_COOKING_TIME}
                            labelledBy="time-label"
                            onChange={(value) => {
                              setFieldValue('time', value);
                              setFieldTouched('time', true, false);
                            }}
                          />
                          {renderError('time', timeError)}
                        </div>
                      </div>
                    </div>

                    <div className={clsx(css.field, css.areaField)}>
                      <span id="area-label" className={css.label}>
                        Area
                      </span>
                      <div className={css.controlWrap}>
                        <SelectField
                          id="area"
                          options={areaOptions}
                          value={values.area}
                          placeholder="Area"
                          labelledBy="area-label"
                          invalid={Boolean(areaError)}
                          describedBy={describedBy('area', areaError)}
                          onChange={(value) => selectChoice('area', value)}
                          onBlur={() => setFieldTouched('area', true)}
                        />
                        {renderError('area', areaError)}
                      </div>
                    </div>

                    <div className={css.ingredientRow}>
                      <div className={clsx(css.field, css.ingredientField)}>
                        <span id="ingredient-label" className={css.label}>
                          Ingredients
                        </span>
                        <div className={css.controlWrap}>
                          <SelectField
                            id="ingredient"
                            searchable
                            options={ingredientOptions}
                            value={draftIngredientId}
                            placeholder="Add the ingredient"
                            labelledBy="ingredient-label"
                            invalid={Boolean(draftErrors.ingredient)}
                            describedBy={describedBy('ingredient', draftErrors.ingredient)}
                            onChange={(value) => {
                              setDraftIngredientId(value);
                              setDraftErrors((prev) => ({ ...prev, ingredient: undefined }));
                            }}
                          />
                          {renderError('ingredient', draftErrors.ingredient)}
                        </div>
                      </div>

                      <div className={clsx(css.controlWrap, css.measureField)}>
                        <div
                          className={clsx(
                            css.underlined,
                            draftErrors.measure && css.underlinedInvalid,
                          )}
                        >
                          <input
                            id="measure"
                            type="text"
                            value={draftMeasure}
                            maxLength={MEASURE_MAX_LENGTH}
                            placeholder="Enter quantity"
                            aria-label="Ingredient quantity"
                            aria-invalid={Boolean(draftErrors.measure) || undefined}
                            aria-describedby={describedBy('measure', draftErrors.measure)}
                            className={css.textInput}
                            onChange={(event) => {
                              setDraftMeasure(event.target.value);
                              setDraftErrors((prev) => ({ ...prev, measure: undefined }));
                            }}
                            onKeyDown={(event) => {
                              if (event.key === 'Enter') {
                                event.preventDefault();
                                addIngredient();
                              }
                            }}
                          />
                        </div>
                        {renderError('measure', draftErrors.measure)}
                      </div>
                    </div>
                  </div>
                </div>

                <button type="button" className={css.outlineButton} onClick={addIngredient}>
                  Add ingredient
                  <PlusIcon className={css.buttonIcon} aria-hidden="true" />
                </button>

                {values.ingredients.length > 0 && (
                  <ul className={css.ingredientList} aria-label="Added ingredients">
                    {values.ingredients.map(({ id, measure }) => {
                      const ingredient = ingredientsById.get(id);
                      const name = ingredient?.name ?? 'Ingredient';

                      return (
                        <li key={id} className={css.ingredientCard}>
                          <div className={css.ingredientImageBox}>
                            {ingredient?.img && (
                              <img
                                src={ingredient.img}
                                alt={name}
                                className={css.ingredientImage}
                              />
                            )}
                          </div>
                          <div className={css.ingredientText}>
                            <p className={css.ingredientName}>{name}</p>
                            <p className={css.ingredientMeasure}>{measure}</p>
                          </div>
                          <button
                            type="button"
                            className={css.removeButton}
                            aria-label={`Remove ${name}`}
                            onClick={() => removeIngredient(id)}
                          >
                            <CloseIcon aria-hidden="true" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}

                {renderError('ingredients', ingredientsError)}
              </div>

              <div className={css.finish}>
                <div className={css.preparation}>
                  <label htmlFor="instructions" className={css.label}>
                    Recipe Preparation
                  </label>
                  <div className={css.controlWrap}>
                    <CountedTextarea
                      {...getFieldProps('instructions')}
                      id="instructions"
                      maxLength={INSTRUCTIONS_MAX_LENGTH}
                      placeholder="Enter recipe"
                      aria-describedby={describedBy('instructions', instructionsError)}
                      invalid={Boolean(instructionsError)}
                    />
                    {renderError('instructions', instructionsError)}
                  </div>
                </div>

                <div className={css.actions}>
                  <button
                    type="button"
                    className={css.deleteButton}
                    aria-label="Clear the form"
                    disabled={isSubmitting}
                    onClick={clearForm}
                  >
                    <TrashIcon className={css.trashIcon} aria-hidden="true" />
                  </button>
                  <button type="submit" className={css.publishButton} disabled={isSubmitting}>
                    {isSubmitting ? 'Publishing…' : 'Publish'}
                  </button>
                </div>
              </div>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
};

export default AddRecipeForm;
