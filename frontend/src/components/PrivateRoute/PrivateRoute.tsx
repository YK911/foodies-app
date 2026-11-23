import { useEffect, type ReactElement } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { openAuthModal } from '../../redux/ui/uiSlice';

interface PrivateRouteProps {
  children: ReactElement;
}

export const PrivateRoute = ({ children }: PrivateRouteProps) => {
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuth);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal('signIn'));
    }
  }, [dispatch, isAuthenticated]);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default PrivateRoute;
