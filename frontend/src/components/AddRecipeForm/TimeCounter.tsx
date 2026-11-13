import clsx from 'clsx';
import MinusIcon from '../../assets/icons/minus.svg?react';
import PlusIcon from '../../assets/icons/plus.svg?react';
import css from './AddRecipeForm.module.css';

interface TimeCounterProps {
  value: number;
  min: number;
  isDefault: boolean;
  labelledBy: string;
  onChange: (value: number) => void;
}

export const TimeCounter = ({ value, min, isDefault, labelledBy, onChange }: TimeCounterProps) => (
  <div className={css.counter} role="group" aria-labelledby={labelledBy}>
    <button
      type="button"
      className={css.iconButton}
      aria-label="Decrease cooking time"
      disabled={value <= min}
      onClick={() => onChange(Math.max(min, value - 1))}
    >
      <MinusIcon className={css.counterIcon} aria-hidden="true" />
    </button>
    <output className={clsx(css.counterValue, isDefault && css.muted)} aria-live="polite">
      {value} min
    </output>
    <button
      type="button"
      className={css.iconButton}
      aria-label="Increase cooking time"
      onClick={() => onChange(value + 1)}
    >
      <PlusIcon className={css.counterIcon} aria-hidden="true" />
    </button>
  </div>
);

export default TimeCounter;
