import Modal from './Modal';
import SignUpForm from './SignUpForm';
import css from './SignInFormModal.module.css';

interface SignUpModalProps {
  onClose: () => void;
  onSignIn: () => void;
}

export default function SignUpModal({ onClose, onSignIn }: SignUpModalProps) {
  return (
    <Modal onClose={onClose}>
      <div className={css.wrapper}>
        <h2 className={css.title}>SIGN UP</h2>

        <SignUpForm onSuccess={onClose} />

        <p className={css.metaText}>
          Already have an account?
          <button type="button" className={css.switchBtn} onClick={onSignIn}>
            Sign in
          </button>
        </p>
      </div>
    </Modal>
  );
}
