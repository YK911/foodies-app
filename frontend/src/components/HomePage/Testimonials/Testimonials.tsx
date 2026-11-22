import { useCallback, useEffect, useState } from 'react';
import clsx from 'clsx';
import QuoteIcon from '../../../assets/icons/quote.svg?react';
import { fetchTestimonials, type Testimonial } from '../../../services/testimonialsApi';
import css from './Testimonials.module.css';

const AUTOPLAY_INTERVAL_MS = 5000;

export const Testimonials = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  // Bumped on manual navigation so the autoplay timer restarts from zero.
  const [timerKey, setTimerKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetchTestimonials(controller.signal)
      .then(setTestimonials)
      .catch(() => {
        // The section hides itself when there is nothing to show.
      });

    return () => controller.abort();
  }, []);

  const count = testimonials.length;

  const showNext = useCallback(() => {
    setActiveIndex((index) => (index + 1) % count);
  }, [count]);

  useEffect(() => {
    if (count < 2 || isPaused) {
      return undefined;
    }

    const timer = window.setInterval(showNext, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(timer);
  }, [count, isPaused, showNext, timerKey]);

  const goTo = (index: number) => {
    setActiveIndex(index);
    setTimerKey((key) => key + 1);
  };

  if (!count) {
    return null;
  }

  const active = testimonials[Math.min(activeIndex, count - 1)];

  return (
    <section className={css.section} aria-labelledby="testimonials-title">
      <div className="container">
        <div
          className={css.slider}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onFocus={() => setIsPaused(true)}
          onBlur={() => setIsPaused(false)}
        >
          <div className={css.reviews}>
            <div className={css.heading}>
              <p className={css.eyebrow}>What our customer say</p>
              <h2 id="testimonials-title" className={css.title}>
                Testimonials
              </h2>
            </div>

            <QuoteIcon className={css.quote} aria-hidden="true" />

            <figure key={active.id} className={css.slide} aria-live="polite">
              <blockquote className={css.text}>
                <p>{active.testimonial}</p>
              </blockquote>
              <figcaption className={css.author}>{active.ownerName}</figcaption>
            </figure>
          </div>

          {count > 1 && (
            <div className={css.dots} role="group" aria-label="Choose testimonial">
              {testimonials.map((testimonial, index) => (
                <button
                  key={testimonial.id}
                  type="button"
                  className={clsx(css.dot, index === activeIndex && css.dotActive)}
                  onClick={() => goTo(index)}
                  aria-label={`Show testimonial ${index + 1} of ${count}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
