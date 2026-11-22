import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAppDispatch } from '../../redux/hooks';
import { logOut } from '../../redux/auth/authSlice';
import Modal from './Modal';
import css from './LogOutModal.module.css';

interface LogOutModalProps {
  onClose: () => void;
}

export default function LogOutModal({ onClose }: LogOutModalProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogOut = async () => {
    try {
      setIsLoading(true);
      await api.post('/auth/logout');
    } catch {
    } finally {
      dispatch(logOut());
      localStorage.clear();
      setIsLoading(false);
      onClose();
      navigate('/', { replace: true });
    }
  };

  return (
    <Modal onClose={onClose}>
      <div className={css.wrapper}>
        <div className={css.textBlock}>
          <h2 className={css.title}>ARE YOU LOGGING OUT?</h2>
          <p className={css.subtitle}>You can always log back in at my time.</p>
        </div>

        <div className={css.btnGroup}>
          <button
            type="button"
            className={css.logoutBtn}
            onClick={handleLogOut}
            disabled={isLoading}
          >
            {isLoading ? 'LOGGING OUT...' : 'LOG OUT'}
          </button>

          <button type="button" className={css.cancelBtn} onClick={onClose} disabled={isLoading}>
            CANCEL
          </button>
        </div>
      </div>
    </Modal>
  );
}
