import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const { t, currentLanguage, switchLanguage } = useLanguage();

  const handleLanguageSwitch = () => {
    const newLanguage = currentLanguage === 'vi' ? 'en' : 'vi';
    switchLanguage(newLanguage);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <Link to="/" className="navbar-logo">
            {t('navbar.brand')}
          </Link>
        </div>
        <ul className="navbar-nav">
          <li className="nav-item">
            <Link 
              to="/" 
              className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            >
              {t('navbar.home')}
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/about" 
              className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}
            >
              {t('navbar.about')}
            </Link>
          </li>
          <li className="nav-item">
            <Link 
              to="/chatbot" 
              className={`nav-link ${location.pathname === '/chatbot' ? 'active' : ''}`}
            >
              {t('navbar.chatbot')}
            </Link>
          </li>
        </ul>
        <div className="language-switcher">
          <button 
            onClick={handleLanguageSwitch}
            className="language-button"
            title={currentLanguage === 'vi' ? 'Switch to English' : 'Chuyển sang tiếng Việt'}
          >
            {currentLanguage === 'vi' ? 'EN' : 'VI'}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
