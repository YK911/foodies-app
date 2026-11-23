import { useNavigate } from 'react-router-dom';
import fe05HeroMain from '../../assets/images/hero-main.webp';
import fe05HeroSmall from '../../assets/images/hero-small.webp';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { openAuthModal } from '../../redux/ui/uiSlice';
import css from './Hero.module.css';

// Original raster assets exported from the Foodies Figma design.
const heroMain = fe05HeroMain;
const heroSmall = fe05HeroSmall;

export const Hero = () => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuth);
  const navigate = useNavigate();

  const addRecipe = () => {
    if (isAuthenticated) navigate('/recipe/add');
    else dispatch(openAuthModal('signIn'));
  };

  return (
    <section className={css.hero} aria-labelledby="hero-title">
      <div className="container">
        <div className={css.copy}>
          <h1 id="hero-title">
            Improve your
            <br className={css.desktopBreak} /> culinary talents
          </h1>
          <p>
            Amazing recipes for beginners in the world of cooking, enveloping you in the aromas and
            tastes of various cuisines.
          </p>
          <button className={css.addButton} type="button" onClick={addRecipe}>
            Add recipe
          </button>
        </div>
        <div className={css.heroPhotos} aria-hidden="true">
          <div className={css.photoSmall}>
            <img src={heroSmall} alt="" loading="eager" decoding="async" />
          </div>
          <div className={css.photoMain}>
            <img src={heroMain} alt="" loading="eager" decoding="async" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
