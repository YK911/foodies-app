import clsx from 'clsx';
import css from './RecipePagination.module.css';

interface RecipePaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

type PageItem = number | 'gap-start' | 'gap-end';

// Always shows the first and last page plus the current page with one neighbour on each side;
// longer runs collapse into "…".
const getPageItems = (page: number, totalPages: number): PageItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const start = Math.max(2, Math.min(page - 1, totalPages - 4));
  const end = Math.min(totalPages - 1, Math.max(page + 1, 5));
  const items: PageItem[] = [1];

  if (start > 2) {
    items.push('gap-start');
  }

  for (let current = start; current <= end; current += 1) {
    items.push(current);
  }

  if (end < totalPages - 1) {
    items.push('gap-end');
  }

  items.push(totalPages);
  return items;
};

export const RecipePagination = ({
  page,
  totalPages,
  onPageChange,
  className,
}: RecipePaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={clsx(css.pagination, className)} aria-label="Recipes pages">
      <ul className={css.list}>
        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            <li key={item}>
              <button
                type="button"
                className={clsx(css.item, item === page && css.active)}
                onClick={() => item !== page && onPageChange(item)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? 'page' : undefined}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className={css.gap} aria-hidden="true">
              …
            </li>
          ),
        )}
      </ul>
    </nav>
  );
};

export default RecipePagination;
