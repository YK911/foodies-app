import { ComponentPropsWithoutRef } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import styles from './PathInfo.module.css';

export type PathInfoItem = {
  label: string;
  to?: string;
};

type PathInfoProps = ComponentPropsWithoutRef<'nav'> & {
  items: PathInfoItem[];
};

export const PathInfo = ({ items, className, ...props }: PathInfoProps) => (
  <nav aria-label="Breadcrumb" className={clsx(styles.navigation, className)} {...props}>
    <ol className={styles.list}>
      {items.map(({ label, to }, index) => {
        const isCurrent = index === items.length - 1;

        return (
          <li className={styles.item} key={`${label}-${index}`}>
            {to && !isCurrent ? (
              <Link className={styles.link} to={to}>
                {label}
              </Link>
            ) : (
              <span className={styles.current} aria-current={isCurrent ? 'page' : undefined}>
                {label}
              </span>
            )}
          </li>
        );
      })}
    </ol>
  </nav>
);
