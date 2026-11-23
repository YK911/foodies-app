import { useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { SelectField, type SelectOption } from '../SelectField/SelectField';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { fetchLookups } from '../../redux/meta/operations';
import css from './RecipeFilters.module.css';

export interface RecipeFiltersValue {
  ingredient: string;
  area: string;
}

interface RecipeFiltersProps {
  value: RecipeFiltersValue;
  onChange: (value: RecipeFiltersValue) => void;
  className?: string;
}

// Sorts the options and, once a filter is set, prepends an empty-value option that clears it.
// Without a selection the field shows its placeholder, as in the design.
const withResetOption = (
  options: SelectOption[],
  selected: string,
  resetLabel: string,
): SelectOption[] => {
  const sorted = [...options].sort((a, b) => a.label.localeCompare(b.label));
  return selected ? [{ value: '', label: resetLabel }, ...sorted] : sorted;
};

// Ingredients are filtered by id, areas by name (the Recipe model stores areaName).
export const RecipeFilters = ({ value, onChange, className }: RecipeFiltersProps) => {
  const dispatch = useAppDispatch();
  const ingredients = useAppSelector((state) => state.meta.ingredients);
  const areas = useAppSelector((state) => state.meta.areas);
  // Guard against lookup endpoints returning wrapped objects instead of arrays.
  const safeIngredients = Array.isArray(ingredients) ? ingredients : [];
  const safeAreas = Array.isArray(areas) ? areas : [];

  useEffect(() => {
    dispatch(fetchLookups());
  }, [dispatch]);

  const ingredientOptions = useMemo(
    () =>
      withResetOption(
        safeIngredients.map(({ id, name }) => ({ value: id, label: name })),
        value.ingredient,
        'All ingredients',
      ),
    [safeIngredients, value.ingredient],
  );

  const areaOptions = useMemo(
    () =>
      withResetOption(
        safeAreas.map(({ name }) => ({ value: name, label: name })),
        value.area,
        'All areas',
      ),
    [safeAreas, value.area],
  );

  return (
    <form
      className={clsx(css.filters, className)}
      aria-label="Recipe filters"
      onSubmit={(event) => event.preventDefault()}
    >
      <SelectField
        id="recipe-filter-ingredient"
        options={ingredientOptions}
        value={value.ingredient}
        placeholder="Ingredients"
        searchable
        onChange={(ingredient) => onChange({ ...value, ingredient })}
      />
      <SelectField
        id="recipe-filter-area"
        options={areaOptions}
        value={value.area}
        placeholder="Area"
        onChange={(area) => onChange({ ...value, area })}
      />
    </form>
  );
};

export default RecipeFilters;
