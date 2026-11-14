import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

const HomePage = React.lazy(() => import('./pages/HomePage/HomePage'));
const RecipePage = React.lazy(() => import('./pages/RecipePage/RecipePage'));
const AddRecipePage = React.lazy(() => import('./pages/AddRecipePage/AddRecipePage'));
const UserPage = React.lazy(() => import('./pages/UserPage/UserPage'));

export const App: React.FC = () => {
  return (
    <>
      <Toaster position="top-right" />
      <Suspense fallback={<div>Завантаження...</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/recipe/:id" element={<RecipePage />} />
          <Route path="/recipe/add" element={<AddRecipePage />} />
          <Route path="/user/:id" element={<UserPage />} />
          <Route path="*" element={<div>Сторінку не знайдено (404)</div>} />
        </Routes>
      </Suspense>
    </>
  );
};

export default App;
