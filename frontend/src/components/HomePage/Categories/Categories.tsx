import fe05Starter from '../../../assets/images/fe05/starter.jpg';
import fe05Side from '../../../assets/images/fe05/side.jpg';
import fe05Seafood from '../../../assets/images/fe05/seafood.jpg';
import fe05Pork from '../../../assets/images/fe05/pork.jpg';
import fe05Pasta from '../../../assets/images/fe05/pasta.jpg';
import fe05Miscellaneous from '../../../assets/images/fe05/miscellaneous.jpg';
import fe05Goat from '../../../assets/images/fe05/goat.jpg';
import fe05Lamb from '../../../assets/images/fe05/lamb.jpg';
import fe05Desserts from '../../../assets/images/fe05/desserts.jpg';
import fe05Breakfast from '../../../assets/images/fe05/breakfast.jpg';
import fe05Beef from '../../../assets/images/fe05/beef.jpg';
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ArrowIcon from '../../../assets/icons/arrow-up-right.svg?react';
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
  const [expanded, setExpanded] = useState(false);
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
        <h2 id="categories-title">Categories</h2>
        <p>Discover a limitless world of culinary possibilities and enjoy exquisite recipes that combine taste, style and the warm atmosphere of the kitchen.</p>
      </div>
      <div className={`${css.grid} ${expanded ? css.expanded : ''}`}>
        {cards.map((item, index) => (
          <button
            key={item.name}
            className={`${css.card} ${item.wide && index < 11 ? css.wide : ''} ${index >= 8 ? css.mobileHidden : ''}`}
            type="button"
            onClick={() => choose(item.name)}
            aria-label={`Browse ${item.name} recipes`}
          >
            <img src={item.image} alt="" loading="lazy" />
            <span className={css.cardActions}><span className={css.name}>{item.name}</span><span className={css.arrow}><ArrowIcon aria-hidden="true" /></span></span>
          </button>
        ))}
        <button className={css.allCategories} type="button" onClick={() => setExpanded((v) => !v)} aria-expanded={expanded}>
          {expanded ? 'Show fewer categories' : 'All categories'}
          <ArrowIcon aria-hidden="true" />
        </button>
      </div>
    </section>
  );
};

export default Categories;
