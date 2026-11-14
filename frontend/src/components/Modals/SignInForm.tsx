import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { isAxiosError } from 'axios';
import toast from 'react-hot-toast';
import api from '../../services/api';
import { useAppDispatch } from '../../redux/hooks';
import { setCredentials, setAuthLoading, setAuthError } from '../../redux/auth/authSlice';
import css from './SignInFormModal.module.css';

interface SignInValues {
  email: string;
  password: string;
}

interface SignInFormProps {
  onSuccess: () => void;
}

const schema = Yup.object().shape({
  email: Yup.string().trim().email('Invalid email address').required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

export default function SignInForm({ onSuccess }: SignInFormProps) {
  const dispatch = useAppDispatch();

  const initialValues: SignInValues = {
    email: '',
    password: '',
  };

  const handleSubmit = async (values: SignInValues) => {
    try {
      dispatch(setAuthLoading(true));
      dispatch(setAuthError(null));

      const { data } = await api.post('/auth/login', {
        email: values.email.trim(),
        password: values.password,
      });

      dispatch(
        setCredentials({
          user: data.user,
          token: data.token,
        }),
      );

      toast.success('Welcome back!', { duration: 2000 });
      onSuccess();
    } catch (error) {
      let errorMessage = 'Incorrect email or password';

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
        const isFormEmpty = !values.email.trim() || !values.password.trim();

        return (
          <Form className={css.form} noValidate autoComplete="off">
            <div className={css.fieldWrap}>
              <Field
                id="signin-email"
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
              <Field
                id="signin-password"
                name="password"
                type="password"
                placeholder="Password"
                aria-label="Password"
                autoComplete="new-password"
                className={errors.password ? `${css.input} ${css.inputError}` : css.input}
              />
              <ErrorMessage name="password" component="p" className={css.error} />
            </div>

            <button type="submit" className={css.submitBtn} disabled={isSubmitting || isFormEmpty}>
              {isSubmitting ? 'SIGNING IN...' : 'SIGN IN'}
            </button>
          </Form>
        );
      }}
    </Formik>
  );
}
