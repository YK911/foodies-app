import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './Subtitle.module.css';

type SubtitleProps<T extends ElementType = 'p'> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export const Subtitle = <T extends ElementType = 'p'>({
  as,
  children,
  className,
  ...props
}: SubtitleProps<T>) => {
  const Component = as ?? 'p';

  return (
    <Component className={clsx(styles.subtitle, className)} {...props}>
      {children}
    </Component>
  );
};
