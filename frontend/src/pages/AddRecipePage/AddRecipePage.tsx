import React from 'react';
import AddRecipeForm from '../../components/AddRecipeForm/AddRecipeForm';
import { MainTitle, PathInfo, Subtitle, type PathInfoItem } from '../../components/Common';
import css from './AddRecipePage.module.css';

const BREADCRUMBS: PathInfoItem[] = [{ label: 'Home', to: '/' }, { label: 'Add recipe' }];

export const AddRecipePage: React.FC = () => {
  return (
    <section className={css.page}>
      <div className={css.container}>
        <div className={css.intro}>
          <PathInfo className={css.breadcrumbs} items={BREADCRUMBS} />
          <div className={css.heading}>
            <MainTitle className={css.title}>Add recipe</MainTitle>
            <Subtitle className={css.subtitle}>
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
