import React from 'react';
import { Link } from 'react-router-dom';
import AddRecipeForm from '../../components/AddRecipeForm/AddRecipeForm';
import css from './AddRecipePage.module.css';

// Local stand-ins: replace with the shared PathInfo, MainTitle and Subtitle once they are merged.
const PathInfo = ({ current }: { current: string }) => (
  <nav aria-label="Breadcrumbs">
    <ol className={css.breadcrumbs}>
      <li>
        <Link to="/" className={css.breadcrumbLink}>
          Home
        </Link>
      </li>
      <li aria-hidden="true" className={css.breadcrumbSeparator}>
        /
      </li>
      <li aria-current="page" className={css.breadcrumbCurrent}>
        {current}
      </li>
    </ol>
  </nav>
);

const MainTitle = ({ children }: { children: React.ReactNode }) => (
  <h1 className={css.title}>{children}</h1>
);

const Subtitle = ({ children }: { children: React.ReactNode }) => (
  <p className={css.subtitle}>{children}</p>
);

export const AddRecipePage: React.FC = () => {
  return (
    <section className={css.page}>
      <div className={css.container}>
        <div className={css.intro}>
          <PathInfo current="Add recipe" />
          <div className={css.heading}>
            <MainTitle>Add recipe</MainTitle>
            <Subtitle>
              Reveal your culinary art, share your favorite recipe and create gastronomic
              masterpieces with us.
            </Subtitle>
          </div>
        </div>
        <AddRecipeForm />
      </div>
    </section>
  );
};

export default AddRecipePage;
