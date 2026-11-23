import { useSearchParams } from 'react-router-dom';
import { Categories } from '../../components/Categories/Categories';
import { Hero } from '../../components/Hero/Hero';
import { CATEGORY_PARAM, Recipes } from '../../components/Recipes';
import { Testimonials } from '../../components/Testimonials';

export const HomePage = () => {
  const [searchParams] = useSearchParams();
  const hasCategory = searchParams.has(CATEGORY_PARAM);

  return (
    <>
      <Hero />
      {hasCategory ? <Recipes /> : <Categories />}
      <Testimonials />
    </>
  );
};

export default HomePage;
