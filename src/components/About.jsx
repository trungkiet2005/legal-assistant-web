import { useLanguage } from '../contexts/LanguageContext';
import './About.css';

const About = () => {
  const { t } = useLanguage();

  return (
    <div className="about">
      <div className="about-container">
        <div className="about-content">
          <h1 className="about-title">{t('about.title')}</h1>
          
          <div className="about-hero">
            <div className="about-image">
              <div className="placeholder-image">
                <span>⚖️</span>
              </div>
            </div>
            <div className="about-intro">
              <h2>{t('about.hero.title')}</h2>
              <p>
                {t('about.hero.description')}
              </p>
            </div>
          </div>

          <div className="about-sections">
            <section className="about-section">
              <h3>{t('about.sections.howItWorks.title')}</h3>
              <p>
                {t('about.sections.howItWorks.content')}
              </p>
            </section>

            <section className="about-section">
              <h3>{t('about.sections.whatWeCover.title')}</h3>
              <p>
                {t('about.sections.whatWeCover.content')}
              </p>
            </section>

            <section className="about-section">
              <h3>{t('about.sections.privacy.title')}</h3>
              <p>
                {t('about.sections.privacy.content')}
              </p>
            </section>

            <section className="about-section">
              <h3>{t('about.sections.disclaimer.title')}</h3>
              <p>
                {t('about.sections.disclaimer.content')}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
