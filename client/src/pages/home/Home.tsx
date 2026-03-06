import './Home.css';
import {
  SparklesIcon,
  EyeIcon,
  PencilDocIcon,
  TargetIcon,
  DocumentPdfIcon,
} from '../../components/icons';

const features = [
  {
    Icon: SparklesIcon,
    title: 'Génération automatique',
    description: 'Générez un CV complet à partir de vos expériences, compétences et formation en quelques secondes.',
  },
  {
    Icon: EyeIcon,
    title: 'Prévisualisation en temps réel',
    description: 'Visualisez votre CV au fur et à mesure de la saisie et des modifications.',
  },
  {
    Icon: PencilDocIcon,
    title: 'Amélioration des descriptions',
    description: 'Reformulation intelligente de vos expériences professionnelles pour les rendre plus percutantes.',
  },
  {
    Icon: TargetIcon,
    title: 'Adaptation à l\'offre',
    description: 'Adaptez votre CV à une offre d\'emploi spécifique pour maximiser vos chances.',
  },
  {
    Icon: DocumentPdfIcon,
    title: 'Export PDF',
    description: 'Exportez votre CV dans un format propre et professionnel, prêt à envoyer aux recruteurs.',
  },
];

export default function Home() {
  const handleGetStarted = () => {
    // TODO: navigation vers l'éditeur / formulaire CV
  };

  return (
    <main className="home">
      <section className="home__hero">
        <img
          src="/title.png"
          alt="CVForge AI"
          className="home__title-image"
        />
        <p className="home__subtitle">
          Générez automatiquement un CV professionnel grâce à l'intelligence artificielle.
          Saisissez vos informations, visualisez en temps réel et exportez un CV optimisé pour les recruteurs et les systèmes ATS.
        </p>
        <div className="home__cta-wrapper">
          <span className="home__cta-arrows home__cta-arrows--left">
            <span className="home__cta-arrow" />
            <span className="home__cta-arrow" />
          </span>
          <button type="button" className="home__cta" onClick={handleGetStarted}>
            Créer mon CV
          </button>
          <span className="home__cta-arrows home__cta-arrows--right">
            <span className="home__cta-arrow" />
            <span className="home__cta-arrow" />
          </span>
        </div>
      </section>

      <section className="home__section">
        <h2 className="home__section-title">Fonctionnalités principales</h2>
        <ul className="home__features">
          {features.map((feature) => {
            const Icon = feature.Icon;
            return (
              <li key={feature.title} className="home__feature">
                <span className="home__feature-icon">
                  <Icon className="home__feature-icon-svg" />
                </span>
                <h3 className="home__feature-title">{feature.title}</h3>
                <p className="home__feature-desc">{feature.description}</p>
              </li>
            );
          })}
        </ul>
      </section>

    </main>
  );
}
