import { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAppDispatch } from '../../redux/hooks';
import { setCredentials, setAuthLoading, setAuthError } from '../../redux/auth/authSlice';
import css from './SignInFormModal.module.css';

interface SignUpValues {
  name: string;
  email: string;
  password: string;
}

interface SignUpFormProps {
  onSuccess: () => void;
}

const schema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be at most 50 characters')
    .required('Name is required'),
  email: Yup.string().trim().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function SignUpForm({ onSuccess }: SignUpFormProps) {
  const dispatch = useAppDispatch();
  const [showPassword, setShowPassword] = useState(false);

  const initialValues: SignUpValues = {
    name: '',
    email: '',
    password: '',
  };

  const handleSubmit = async (values: SignUpValues) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));

      const { data } = await api.post('/auth/register', {
        name: values.name.trim(),
        email: values.email.trim(),
        password: values.password,
      });

      // Автоматична авторизація після реєстрації
      dispatch(
        setCredentials({
          user: data.user,
          token: data.token,
        }),
      );

      toast.success('Account created successfully!', { duration: 2000 });
      onSuccess();
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again.';

      if (isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      dispatch(setAuthError(errorMessage));
      toast.error(errorMessage, { duration: 4000 });
    } finally {
      dispatch(setAuthLoading(false));
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      validateOnChange={false}
      validateOnBlur={false}
      onSubmit={handleSubmit}
    >
      {({ errors, isSubmitting, values }) => {
        const isFormEmpty = !values.name.trim() || !values.email.trim() || !values.password.trim();

        return (
          <Form className={css.form} noValidate autoComplete="off">
            <div className={css.fieldWrap}>
              <Field
                id="signup-name"
                name="name"
                type="text"
                placeholder="Name*"
                aria-label="Name"
                autoComplete="off"
                className={errors.name ? `${css.input} ${css.inputError}` : css.input}
              />
              <ErrorMessage name="name" component="p" className={css.error} />
            </div>

            <div className={css.fieldWrap}>
              <Field
                id="signup-email"
                name="email"
                type="email"
                placeholder="Email*"
                aria-label="Email"
                autoComplete="off"
                className={errors.email ? `${css.input} ${css.inputError}` : css.input}
              />
              <ErrorMessage name="email" component="p" className={css.error} />
            </div>

            <div className={css.fieldWrap}>
              <div className={css.passwordBox}>
                <Field
                  id="signup-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  aria-label="Password"
                  autoComplete="new-password"
                  className={`${errors.password ? `${css.input} ${css.inputError}` : css.input} ${css.passwordInput}`}
                />
                <button
                  type="button"
                  className={css.eyeBtn}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    /* Відкрите око — пароль видимий */
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  ) : (
                    /* Закреслене око — пароль прихований */
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  )}
                </button>
              </div>
              <ErrorMessage name="password" component="p" className={css.error} />
            </div>

            <button type="submit" className={css.submitBtn} disabled={isSubmitting || isFormEmpty}>
              {isSubmitting ? 'CREATING...' : 'CREATE'}
            </button>
          </Form>
        );
      }}
    </Formik>
  );
}
