import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { Loader } from '../Common';
import { Header } from './Header';
import { Footer } from './Footer';
import css from './SharedLayout.module.css';

export const SharedLayout = () => {
  return (
    <div className={css.layout}>
      <Header />
      <main className={css.main}>
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
};

export default SharedLayout;
