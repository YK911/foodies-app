import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { closeAuthModal, openAuthModal } from '../../redux/ui/uiSlice';
import SignInModal from './SignInModal';
import SignUpModal from './SignUpModal';

export default function AuthModalHost() {
  const dispatch = useAppDispatch();
  const active = useAppSelector((state) => state.ui.authModal);
  const close = () => dispatch(closeAuthModal());

  if (active === 'signIn') {
    return (
      <SignInModal
        onClose={close}
        onCreateAccount={() => dispatch(openAuthModal('signUp'))}
      />
    );
  }

  if (active === 'signUp') {
    return (
      <SignUpModal
        onClose={close}
        onSignIn={() => dispatch(openAuthModal('signIn'))}
      />
    );
  }

  return null;
}
