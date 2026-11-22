import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import clsx from 'clsx';
import ChevronIcon from '../../assets/icons/chevron-down.svg?react';
import css from './SelectField.module.css';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectFieldProps {
  id: string;
  options: SelectOption[];
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  // Called when the list closes without a choice, e.g. to mark the field as touched.
  onBlur?: () => void;
  searchable?: boolean;
  invalid?: boolean;
  labelledBy?: string;
  describedBy?: string;
  className?: string;
}

export const SelectField = ({
  id,
  options,
  value,
  placeholder,
  onChange,
  onBlur,
  searchable = false,
  invalid = false,
  labelledBy,
  describedBy,
  className,
}: SelectFieldProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(-1);

  const listId = `${id}-listbox`;
  const selected = options.find((option) => option.value === value);

  const visibleOptions = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!searchable || !search) {
      return options;
    }

    return options.filter((option) => option.label.toLowerCase().includes(search));
  }, [options, query, searchable]);

  const open = () => {
    const selectedIndex = selected ? visibleOptions.indexOf(selected) : -1;

    setIsOpen(true);
    setActiveIndex(Math.max(selectedIndex, 0));
  };

  const close = (notifyBlur = true) => {
    setIsOpen(false);
    setQuery('');
    setActiveIndex(-1);

    if (notifyBlur) {
      onBlur?.();
    }
  };

  // Keeps the outside-click listener pointed at the latest close().
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        closeRef.current();
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    return () => document.removeEventListener('mousedown', handlePointerDown);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || activeIndex < 0) {
      return;
    }

    const activeItem = listRef.current?.children[activeIndex];
    activeItem?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex, isOpen]);

  const select = (option: SelectOption) => {
    onChange(option.value);
    close(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          open();
        } else {
          setActiveIndex((index) => Math.min(index + 1, visibleOptions.length - 1));
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (isOpen) {
          setActiveIndex((index) => Math.max(index - 1, 0));
        }
        break;
      case 'Enter':
        // In a text input Enter would submit the surrounding form.
        if (isOpen || searchable) {
          event.preventDefault();
        }
        if (isOpen && visibleOptions[activeIndex]) {
          select(visibleOptions[activeIndex]);
        }
        break;
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          close();
        }
        break;
      case 'Tab':
        if (isOpen) {
          close();
        }
        break;
      default:
    }
  };

  const activeDescendant =
    isOpen && activeIndex >= 0 && visibleOptions[activeIndex]
      ? `${id}-option-${activeIndex}`
      : undefined;

  const comboboxProps = {
    id,
    'aria-haspopup': 'listbox' as const,
    'aria-expanded': isOpen,
    'aria-controls': listId,
    'aria-activedescendant': activeDescendant,
    'aria-invalid': invalid || undefined,
    'aria-describedby': describedBy,
    onKeyDown: handleKeyDown,
  };

  return (
    <div ref={rootRef} className={clsx(css.root, className)}>
      {searchable ? (
        <div className={clsx(css.control, invalid && css.invalid, isOpen && css.open)}>
          <input
            {...comboboxProps}
            type="text"
            role="combobox"
            autoComplete="off"
            aria-autocomplete="list"
            aria-labelledby={labelledBy}
            className={css.input}
            value={isOpen ? query : (selected?.label ?? '')}
            placeholder={isOpen && selected ? selected.label : placeholder}
            onClick={() => !isOpen && open()}
            onChange={(event) => {
              setQuery(event.target.value);
              setIsOpen(true);
              setActiveIndex(0);
            }}
          />
          <button
            type="button"
            tabIndex={-1}
            className={css.chevronButton}
            aria-label={isOpen ? 'Hide options' : 'Show options'}
            onClick={() => (isOpen ? close() : open())}
          >
            <ChevronIcon className={css.chevron} aria-hidden="true" />
          </button>
        </div>
      ) : (
        <button
          {...comboboxProps}
          type="button"
          aria-labelledby={labelledBy ? `${labelledBy} ${id}` : undefined}
          className={clsx(css.control, css.trigger, invalid && css.invalid, isOpen && css.open)}
          onClick={() => (isOpen ? close() : open())}
        >
          <span className={clsx(css.value, !selected && css.placeholder)}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronIcon className={css.chevron} aria-hidden="true" />
        </button>
      )}

      {isOpen && (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          aria-labelledby={labelledBy}
          className={css.list}
        >
          {visibleOptions.length ? (
            visibleOptions.map((option, index) => (
              <li
                key={option.value}
                id={`${id}-option-${index}`}
                role="option"
                aria-selected={option.value === value}
                className={clsx(
                  css.option,
                  index === activeIndex && css.active,
                  option.value === value && css.selected,
                )}
                onMouseDown={(event) => event.preventDefault()}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => select(option)}
              >
                {option.label}
              </li>
            ))
          ) : (
            <li role="presentation" className={css.empty}>
              Nothing found
            </li>
          )}
        </ul>
      )}
    </div>
  );
};

export default SelectField;
