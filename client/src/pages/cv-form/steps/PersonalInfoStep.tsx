import type { PersonalInfo } from '../../../types/cv';

interface Props {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

export default function PersonalInfoStep({ data, onChange }: Props) {
  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="step">
      <h2 className="step__title">Informations personnelles</h2>

      <div className="step__card">
        <div className="step__row">
          <label className="step__field">
            <span className="step__label">Prénom *</span>
            <input
              type="text"
              className="step__input"
              value={data.firstName}
              onChange={(e) => update('firstName', e.target.value)}
              placeholder="Jean"
            />
          </label>
          <label className="step__field">
            <span className="step__label">Nom *</span>
            <input
              type="text"
              className="step__input"
              value={data.lastName}
              onChange={(e) => update('lastName', e.target.value)}
              placeholder="Dupont"
            />
          </label>
        </div>

        <label className="step__field">
          <span className="step__label">Titre professionnel *</span>
          <input
            type="text"
            className="step__input"
            value={data.title}
            onChange={(e) => update('title', e.target.value)}
            placeholder="Développeur Full-Stack"
          />
        </label>

        <label className="step__field">
          <span className="step__label">Résumé / Présentation</span>
          <textarea
            className="step__textarea"
            value={data.summary}
            onChange={(e) => update('summary', e.target.value)}
            placeholder="Présentez-vous en quelques lignes : votre profil, votre disponibilité, ce que vous recherchez..."
            rows={3}
          />
        </label>

        <div className="step__row">
          <label className="step__field">
            <span className="step__label">Email *</span>
            <input
              type="email"
              className="step__input"
              value={data.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="jean.dupont@email.com"
            />
          </label>
          <label className="step__field">
            <span className="step__label">Téléphone</span>
            <input
              type="tel"
              className="step__input"
              value={data.phone}
              onChange={(e) => update('phone', e.target.value)}
              placeholder="06 12 34 56 78"
            />
          </label>
        </div>

        <label className="step__field">
          <span className="step__label">Ville</span>
          <input
            type="text"
            className="step__input"
            value={data.city}
            onChange={(e) => update('city', e.target.value)}
            placeholder="Paris, France"
          />
        </label>
      </div>

      <h3 className="step__subtitle">Liens (optionnels)</h3>

      <div className="step__card">
        <label className="step__field">
          <span className="step__label">LinkedIn</span>
          <input
            type="url"
            className="step__input"
            value={data.linkedin}
            onChange={(e) => update('linkedin', e.target.value)}
            placeholder="https://linkedin.com/in/jean-dupont"
          />
        </label>

        <div className="step__row">
          <label className="step__field">
            <span className="step__label">Portfolio / Site web</span>
            <input
              type="url"
              className="step__input"
              value={data.portfolio}
              onChange={(e) => update('portfolio', e.target.value)}
              placeholder="https://mon-site.com"
            />
          </label>
          <label className="step__field">
            <span className="step__label">GitHub</span>
            <input
              type="url"
              className="step__input"
              value={data.github}
              onChange={(e) => update('github', e.target.value)}
              placeholder="https://github.com/jean-dupont"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
