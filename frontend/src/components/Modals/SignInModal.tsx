import Modal from './Modal';
import SignInForm from './SignInForm';
import css from './SignInFormModal.module.css';

interface SignInModalProps {
  onClose: () => void;
  onCreateAccount: () => void;
}

export default function SignInModal({ onClose, onCreateAccount }: SignInModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className={css.wrapper}>
        <h2 className={css.title}>SIGN IN</h2>

        <SignInForm onSuccess={onClose} />

        <p className={css.metaText}>
          Don&apos;t have an account?
          <button type="button" className={css.switchBtn} onClick={onCreateAccount}>
            Create an account
          </button>
        </p>
      </div>
    </Modal>
  );
}
