import { useEffect, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../../redux/hooks';
import { closeAuthModal, openAuthModal } from '../../../redux/ui/uiSlice';
import { setCredentials } from '../../../redux/auth/authSlice';
import api from '../../../services/api';
import css from './FE05AuthBridge.module.css';

interface AuthPayload {
  user: { id: string; name: string; email: string; avatar: string | null };
  token: string;
}

/** Temporary FE-05 integration bridge. Remove when the shared FE-04 modal host is merged. */
export const FE05AuthBridge = () => {
  const dispatch = useAppDispatch();
  const active = useAppSelector((state) => state.ui.authModal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!active) return;
    setError('');
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') dispatch(closeAuthModal());
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, dispatch]);

  if (!active) return null;
  const signup = active === 'signUp';
  const switchMode = () => {
    setError('');
    dispatch(openAuthModal(signup ? 'signIn' : 'signUp'));
  };
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      const endpoint = signup ? '/auth/register' : '/auth/login';
      const body = signup ? { name: name.trim(), email: email.trim(), password } : { email: email.trim(), password };
      const { data } = await api.post<AuthPayload>(endpoint, body);
      if (!data?.token || !data?.user) throw new Error('Invalid authentication response');
      dispatch(setCredentials({ user: data.user, token: data.token }));
    } catch (reason: unknown) {
      // The backend may be unavailable locally; keep the modal open and show a clear failure.
      const responseMessage = typeof reason === 'object' && reason !== null && 'response' in reason
        ? (reason as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      setError(responseMessage || (reason instanceof Error ? reason.message : 'Authentication failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={css.overlay} onMouseDown={(event) => {
      if (event.target === event.currentTarget && !busy) dispatch(closeAuthModal());
    }}>
      <section className={css.dialog} role="dialog" aria-modal="true" aria-labelledby="fe05-auth-heading">
        <button type="button" className={css.close} onClick={() => dispatch(closeAuthModal())} aria-label="Close sign in dialog">×</button>
        <h2 id="fe05-auth-heading">{signup ? 'SIGN UP' : 'SIGN IN'}</h2>
        <form onSubmit={submit} className={css.form}>
          {signup && <label className={css.label}>Name<input autoFocus required minLength={2} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} /></label>}
          <label className={css.label}>Email<input autoFocus={!signup} type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
          <label className={css.label}>Password<input type="password" required minLength={8} autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
          {error && <p role="alert" className={css.error}>{error}</p>}
          <button className={css.submit} disabled={busy} type="submit">{busy ? 'PLEASE WAIT...' : signup ? 'CREATE ACCOUNT' : 'SIGN IN'}</button>
        </form>
        <p className={css.switch}>{signup ? 'Already have an account?' : "Don't have an account?"} <button type="button" onClick={switchMode}>{signup ? 'Sign in' : 'Create an account'}</button></p>
      </section>
    </div>
  );
};
