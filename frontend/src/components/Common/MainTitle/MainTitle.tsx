import { ComponentPropsWithoutRef, ElementType, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './MainTitle.module.css';

type MainTitleProps<T extends ElementType = 'h1'> = {
  as?: T;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

export const MainTitle = <T extends ElementType = 'h1'>({
  as,
  children,
  className,
  ...props
}: MainTitleProps<T>) => {
  const Component = as ?? 'h1';

  return (
    <Component className={clsx(styles.title, className)} {...props}>
      {children}
    </Component>
  );
};
