import { Link } from 'react-router-dom';
import { Icon } from '../Icon/Icon';
import css from './Footer.module.css';

const SOCIAL_LINKS = [
  {
    name: 'facebook',
    href: 'https://www.facebook.com/goITclub/',
  },
  {
    name: 'instagram',
    href: 'https://www.instagram.com/goitclub/',
  },
  {
    name: 'youtube',
    href: 'https://www.youtube.com/c/GoIT',
  },
];

export const Footer = () => {
  return (
    <footer className={css.footer}>
      <div className="container">
        <div className={css.top}>
          <Link className={css.logo} to="/" aria-label="Foodies home">
            foodies
          </Link>
          <ul className={css.socialList} aria-label="Social media links">
            {SOCIAL_LINKS.map(({ name, href }) => (
              <li key={name}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={css.socialLink}
                  aria-label={name}
                >
                  <Icon name={name} size={20} />
                </a>
              </li>
            ))}
          </ul>
        </div>
        <div className={css.bottom}>
          <p className={css.copyright}>@2024, Foodies. All rights reserved</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
