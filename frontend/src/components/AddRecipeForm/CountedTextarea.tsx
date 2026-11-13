import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type TextareaHTMLAttributes,
} from 'react';
import clsx from 'clsx';
import css from './AddRecipeForm.module.css';

interface CountedTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  value: string;
  maxLength: number;
  invalid?: boolean;
}

export const CountedTextarea = ({
  value,
  maxLength,
  invalid = false,
  className,
  ...textareaProps
}: CountedTextareaProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Grows with the text instead of showing a scrollbar.
  const fitHeight = useCallback(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, []);

  useLayoutEffect(fitHeight, [value, fitHeight]);

  // Text re-wraps when the width changes or the web font finishes loading.
  useEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) {
      return undefined;
    }

    let width = textarea.clientWidth;
    const observer = new ResizeObserver(() => {
      if (textarea.clientWidth !== width) {
        width = textarea.clientWidth;
        fitHeight();
      }
    });

    observer.observe(textarea);
    document.fonts?.ready.then(fitHeight);
    document.fonts?.addEventListener('loadingdone', fitHeight);

    return () => {
      observer.disconnect();
      document.fonts?.removeEventListener('loadingdone', fitHeight);
    };
  }, [fitHeight]);

  return (
    <div className={clsx(css.underlined, invalid && css.underlinedInvalid, className)}>
      <textarea
        {...textareaProps}
        ref={textareaRef}
        rows={1}
        value={value}
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        className={css.textarea}
      />
      <span className={css.charCounter} aria-hidden="true">
        <span className={clsx(value.length > 0 && css.charCounterCurrent)}>{value.length}</span>/
        {maxLength}
      </span>
    </div>
  );
};

export default CountedTextarea;
