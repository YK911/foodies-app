import React, { Suspense } from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { closeLogOutModal } from './redux/ui/uiSlice';
import AuthModalHost from './components/Modals/AuthModalHost';
import LogOutModal from './components/Modals/LogOutModal';
import { SharedLayout } from './components/SharedLayout/SharedLayout';
import { PrivateRoute } from './components/PrivateRoute/PrivateRoute';

const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'));
const RecipePage = React.lazy(() => import('./pages/RecipePage/RecipePage'));
const AddRecipePage = React.lazy(() => import('./pages/AddRecipePage/AddRecipePage'));
const UserPage = React.lazy(() => import('./pages/UserPage/UserPage'));

export const App: React.FC = () => {
  const dispatch = useAppDispatch();
  const logoutOpen = useAppSelector((state) => state.ui.logOutModal);

  return (
    <>
      <Toaster position="top-right" />
      <AuthModalHost />
      {logoutOpen && <LogOutModal onClose={() => dispatch(closeLogOutModal())} />}
      <Routes>
        <Route path="/" element={<SharedLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:id" element={<RecipePage />} />

          <Route
            path="/recipe/add"
            element={
              <PrivateRoute>
                <AddRecipePage />
              </PrivateRoute>
            }
          />
          <Route
            path="/user/:id"
            element={
              <PrivateRoute>
                <UserPage />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
