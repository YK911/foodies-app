import { useSearchParams } from 'react-router-dom';
import { Hero } from '../../components/HomePage/Hero/Hero';
import { Categories } from '../../components/HomePage/Categories/Categories';
import { CATEGORY_PARAM, Recipes } from '../../components/HomePage/Recipes';
import { Testimonials } from '../../components/HomePage/Testimonials';

export const HomePage = () => {
  const [searchParams] = useSearchParams();
  const hasCategory = searchParams.has(CATEGORY_PARAM);

  return (
    <main>
      <Hero />
      {hasCategory ? <Recipes /> : <Categories />}
      <Testimonials />
    </main>
  );
};

export default HomePage;
