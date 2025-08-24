import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import './Home.css';

const Home = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleStartChat = () => {
    navigate('/chatbot');
  };

  const handleLearnMore = () => {
    navigate('/about');
  };

  return (
    <div className="home">
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-title">{t('home.title')}</h1>
          <p className="home-subtitle">
            {t('home.subtitle')}
          </p>
          <div className="home-actions">
            <button className="btn btn-primary" onClick={handleStartChat}>
              {t('home.startChat')}
            </button>
            <button className="btn btn-secondary" onClick={handleLearnMore}>
              {t('home.learnMore')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
