import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: string;
  size?: number | string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 18, className = '', ...props }) => {
  return (
    <svg width={size} height={size} className={className} aria-hidden="true" {...props}>
      <use href={`${import.meta.env.BASE_URL}sprite.svg#${name}`} />
    </svg>
  );
};
