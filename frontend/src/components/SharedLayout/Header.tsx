import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../../redux/hooks';
import { openAuthModal, openLogOutModal } from '../../redux/ui/uiSlice';
import { Icon } from '../Icon/Icon';

import css from './Header.module.css';

export const Header = () => {
  const dispatch = useAppDispatch();
  const { pathname } = useLocation();
  const isHomePage = pathname === '/';

  const isAuthenticated = useAppSelector((state) => state.auth.isAuth);
  const user = useAppSelector((state) => state.auth.user);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const userBarRef = useRef<HTMLDivElement>(null);

  // Закриваємо меню при переході на іншу сторінку
  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Закриття dropdown по кліку зовні та Escape
  useEffect(() => {
    if (!isDropdownOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (userBarRef.current && !userBarRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsDropdownOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDropdownOpen]);

  // Блокування скролу body при відкритому мобільному бургер-меню
  useEffect(() => {
    if (!isMobileMenuOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsMobileMenuOpen(false);
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMobileMenuOpen]);

  const handleOpenLogOut = () => {
    setIsDropdownOpen(false);
    setIsMobileMenuOpen(false);
    dispatch(openLogOutModal());
  };

  const userProfilePath = `/user/${encodeURIComponent(user?.id ?? '')}`;
  const userInitial = (user?.name || 'U').trim().charAt(0).toUpperCase();

  return (
    <header className={clsx(css.header, isHomePage ? css.dark : css.light)}>
      <div className={clsx('container', css.container)}>
        <Link className={css.logo} to="/" aria-label="Foodies home">
          foodies
        </Link>

        {/* Навігація для авторизованого користувача (tablet / desktop) */}
        {isAuthenticated && (
          <nav className={css.nav} aria-label="Main navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) => clsx(css.navLink, isActive && css.navLinkActive)}
            >
              Home
            </NavLink>
            <NavLink
              to="/recipe/add"
              className={({ isActive }) => clsx(css.navLink, isActive && css.navLinkActive)}
            >
              Add recipe
            </NavLink>
          </nav>
        )}

        <div className={css.rightGroup}>
          {isAuthenticated ? (
            <>
              {/* UserBar */}
              <div className={css.userBar} ref={userBarRef}>
                <button
                  type="button"
                  className={css.userTrigger}
                  onClick={() => setIsDropdownOpen((prev) => !prev)}
                  aria-expanded={isDropdownOpen}
                  aria-haspopup="menu"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className={css.avatar} />
                  ) : (
                    <span className={css.avatarFallback} aria-hidden="true">
                      {userInitial}
                    </span>
                  )}
                  <span className={css.userName}>{user?.name || 'Profile'}</span>
                  <Icon
                    name="chevron-down"
                    className={clsx(css.chevron, isDropdownOpen && css.chevronOpen)}
                    aria-hidden="true"
                  />
                </button>

                {isDropdownOpen && (
                  <div className={css.dropdown} role="menu">
                    <Link
                      to={userProfilePath}
                      className={css.dropdownItem}
                      role="menuitem"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                    <button
                      type="button"
                      className={css.dropdownItem}
                      role="menuitem"
                      onClick={handleOpenLogOut}
                    >
                      <span>Log out</span>
                      <Icon name="arrow-up-right" className={css.dropdownIcon} aria-hidden="true" />
                    </button>
                  </div>
                )}
              </div>

              {/* Кнопка бургер-меню (лише для мобільної версії < 768px) */}
              <button
                type="button"
                className={css.burgerBtn}
                onClick={() => setIsMobileMenuOpen(true)}
                aria-label="Open navigation menu"
                aria-expanded={isMobileMenuOpen}
              >
                <span />
                <span />
                <span />
              </button>
            </>
          ) : (
            /* AuthBar */
            <div className={css.authBar}>
              <button
                type="button"
                className={css.signInBtn}
                onClick={() => dispatch(openAuthModal('signIn'))}
              >
                Sign in
              </button>
              <button
                type="button"
                className={css.signUpBtn}
                onClick={() => dispatch(openAuthModal('signUp'))}
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Мобільне бургер-меню (виїжджає справа на весь viewport) */}
      {isAuthenticated && (
        <div
          className={clsx(css.mobileMenu, isMobileMenuOpen && css.mobileMenuOpen)}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className={css.mobileMenuTop}>
            <Link className={css.mobileLogo} to="/" onClick={() => setIsMobileMenuOpen(false)}>
              foodies
            </Link>
            <button
              type="button"
              className={css.mobileCloseBtn}
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close navigation menu"
            >
              <Icon name="x" className={css.mobileCloseIcon} aria-hidden="true" />
            </button>
          </div>

          <nav className={css.mobileNav} aria-label="Mobile navigation">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                clsx(css.mobileNavLink, isActive && css.mobileNavLinkActive)
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </NavLink>
            <NavLink
              to="/recipe/add"
              className={({ isActive }) =>
                clsx(css.mobileNavLink, isActive && css.mobileNavLinkActive)
              }
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Add recipe
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;
