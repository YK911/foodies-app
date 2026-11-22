import fe05Starter from '../../../assets/images/fe05/starter.webp';
import fe05Side from '../../../assets/images/fe05/side.webp';
import fe05Seafood from '../../../assets/images/fe05/seafood.webp';
import fe05Pork from '../../../assets/images/fe05/pork.webp';
import fe05Pasta from '../../../assets/images/fe05/pasta.webp';
import fe05Miscellaneous from '../../../assets/images/fe05/miscellaneous.webp';
import fe05Goat from '../../../assets/images/fe05/goat.webp';
import fe05Lamb from '../../../assets/images/fe05/lamb.webp';
import fe05Desserts from '../../../assets/images/fe05/desserts.webp';
import fe05Breakfast from '../../../assets/images/fe05/breakfast.webp';
import fe05Beef from '../../../assets/images/fe05/beef.webp';
import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import spriteUrl from '../../../assets/icons/sprite.svg?url';
import { MainTitle, Subtitle } from '../../Common';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { fetchLookups } from '../../../redux/meta/operations';
import { CATEGORY_PARAM } from '../Recipes';
import css from './Categories.module.css';

// Original category photographs from the Foodies Figma design.
// Preserve the curated order and responsive card proportions.
const curated = [
  { name: 'Beef', image: fe05Beef, wide: false },
  { name: 'Breakfast', image: fe05Breakfast, wide: false },
  { name: 'Desserts', image: fe05Desserts, wide: true },
  { name: 'Lamb', image: fe05Lamb, wide: true },
  { name: 'Goat', image: fe05Goat, wide: false },
  { name: 'Miscellaneous', image: fe05Miscellaneous, wide: false },
  { name: 'Pasta', image: fe05Pasta, wide: false },
  { name: 'Pork', image: fe05Pork, wide: true },
  { name: 'Seafood', image: fe05Seafood, wide: false },
  { name: 'Side', image: fe05Side, wide: true },
  { name: 'Starter', image: fe05Starter, wide: false },
];

export const Categories = () => {
  const dispatch = useAppDispatch();
  const categories = useAppSelector((state) => state.meta.categories);
  const [, setSearchParams] = useSearchParams();

  useEffect(() => { void dispatch(fetchLookups()); }, [dispatch]);
  // Some API responses wrap the categories array in { data } or { categories }.
  // Redux state is typed as Category[], but runtime JSON may still have those wrappers.
  // Normalize before reading .length or calling .map so an unexpected response cannot
  // crash the entire HomePage (see FE-05 browser regression).
  const cards = useMemo(() => {
    const extractCategories = (input: unknown): { name: string }[] => {
      let value: unknown = input;
      for (let depth = 0; depth < 3; depth += 1) {
        if (Array.isArray(value)) {
          return value.filter(
            (entry): entry is { name: string } =>
              typeof entry === 'object' && entry !== null &&
              'name' in entry && typeof entry.name === 'string' && Boolean(entry.name.trim()),
          );
        }
        if (typeof value !== 'object' || value === null) break;
        const record = value as Record<string, unknown>;
        value = record.data ?? record.categories ?? record.items ?? record.results;
      }
      return [];
    };

    const apiCategories = extractCategories(categories);
    if (!apiCategories.length) return curated;
    const available = new Set(apiCategories.map((item) => item.name.toLowerCase()));
    const main = curated.filter((item) => available.has(item.name.toLowerCase()));
    const extras = apiCategories
      .filter((item) => !curated.some((c) => c.name.toLowerCase() === item.name.toLowerCase()))
      .map((item) => ({ name: item.name, image: fe05Miscellaneous, wide: false }));
    return [...main, ...extras];
  }, [categories]);

  const choose = (name: string) => {
    setSearchParams((params) => {
      const next = new URLSearchParams(params);
      next.set(CATEGORY_PARAM, name);
      next.delete('area');
      next.delete('ingredient');
      next.delete('page');
      return next;
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  return (
    <section className={css.categories} aria-labelledby="categories-title">
      <div className={css.intro}>
        <MainTitle as="h2" id="categories-title">Categories</MainTitle>
        <Subtitle>Discover a limitless world of culinary possibilities and enjoy exquisite recipes that combine taste, style and the warm atmosphere of the kitchen.</Subtitle>
      </div>
      <div className={css.grid}>
        {cards.map((item, index) => (
          <button
            key={item.name}
            className={`${css.card} ${item.wide && index < 11 ? css.wide : ''} ${index >= 8 ? css.mobileHidden : ''}`}
            type="button"
            onClick={() => choose(item.name)}
            aria-label={`Browse ${item.name} recipes`}
          >
            <img src={item.image} alt="" loading="lazy" decoding="async" />
            <span className={css.cardActions}><span className={css.name}>{item.name}</span><span className={css.arrow}><svg aria-hidden="true"><use href={`${spriteUrl}#arrow-up-right`} /></svg></span></span>
          </button>
        ))}
        <button className={css.allCategories} type="button" onClick={() => choose('')}>
          All categories
          <svg aria-hidden="true"><use href={`${spriteUrl}#arrow-up-right`} /></svg>
        </button>
      </div>
    </section>
  );
};

export default Categories;
