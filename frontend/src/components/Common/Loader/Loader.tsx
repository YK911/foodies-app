import { ComponentPropsWithoutRef } from 'react';
import clsx from 'clsx';
import styles from './Loader.module.css';

type LoaderProps = ComponentPropsWithoutRef<'div'> & {
  label?: string;
  size?: 'small' | 'medium' | 'large';
};

export const Loader = ({
  className,
  label = 'Loading',
  size = 'medium',
  ...props
}: LoaderProps) => (
  <div
    className={clsx(styles.loader, styles[size], className)}
    role="status"
    aria-label={label}
    {...props}
  >
    <span className={styles.hidden}>{label}</span>
  </div>
);
