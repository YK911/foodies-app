import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import clsx from 'clsx';
import CaptureFrameIcon from '../../assets/icons/capture-frame.svg?react';
import CameraIcon from '../../assets/icons/camera.svg?react';
import css from './AddRecipeForm.module.css';

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface PhotoFieldProps {
  id: string;
  file: File | null;
  error?: string;
  onChange: (file: File) => void;
}

export const PhotoField = ({ id, file, error, onChange }: PhotoFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const errorId = `${id}-error`;

  // A fresh object URL per file; the cleanup frees the previous one.
  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return undefined;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.currentTarget.files?.[0];

    if (selectedFile) {
      onChange(selectedFile);
    }

    // Lets the same file be picked again after the form is cleared.
    event.currentTarget.value = '';
  };

  return (
    <div className={css.photoColumn}>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        className={css.visuallyHidden}
        aria-invalid={Boolean(error) || undefined}
        aria-describedby={error ? errorId : undefined}
        onChange={handleChange}
      />

      {previewUrl ? (
        <>
          <img src={previewUrl} alt="Preview of the recipe photo" className={css.photoPreview} />
          <button
            type="button"
            className={css.uploadLink}
            onClick={() => inputRef.current?.click()}
          >
            Upload another photo
          </button>
        </>
      ) : (
        <label htmlFor={id} className={clsx(css.dropzone, error && css.dropzoneInvalid)}>
          <span className={css.uploadIcon} aria-hidden="true">
            <CaptureFrameIcon />
            <CameraIcon className={css.cameraIcon} />
          </span>
          <span className={css.uploadLink}>Upload a photo</span>
        </label>
      )}

      {error && (
        <p id={errorId} className={css.error} role="alert">
          {error}
        </p>
      )}
    </div>
  );
};

export default PhotoField;
