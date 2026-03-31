import { useState } from 'react';
import type { Language, Certification, AccentColor, CVTemplate } from '../../../types/cv';

const ACCENT_COLORS: { value: AccentColor; label: string; hex: string }[] = [
  { value: 'blue',   label: 'Bleu',   hex: '#2563eb' },
  { value: 'teal',   label: 'Sarcelle', hex: '#0d9488' },
  { value: 'green',  label: 'Vert',   hex: '#16a34a' },
  { value: 'orange', label: 'Orange', hex: '#ea580c' },
  { value: 'red',    label: 'Rouge',  hex: '#dc2626' },
  { value: 'pink',   label: 'Rose',   hex: '#db2777' },
  { value: 'violet', label: 'Violet', hex: '#7c3aed' },
  { value: 'black',  label: 'Noir',   hex: '#1f2937' },
];

const TEMPLATES: { value: CVTemplate; label: string; desc: string }[] = [
  { value: 'classic', label: 'Classique', desc: 'Sobre et professionnel, optimisé ATS' },
  { value: 'classic_dev', label: 'Classique dev', desc: 'Comme le classique, compétences regroupées par thème (front, back, IA…)' },
  { value: 'creative', label: 'Créatif', desc: 'Design 2 colonnes avec photo' },
];

interface Props {
  languages: Language[];
  certifications: Certification[];
  interests: string[];
  accentColor: AccentColor;
  template: CVTemplate;
  onChangeLanguages: (data: Language[]) => void;
  onChangeCertifications: (data: Certification[]) => void;
  onChangeInterests: (data: string[]) => void;
  onChangeAccentColor: (color: AccentColor) => void;
  onChangeTemplate: (template: CVTemplate) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const LEVELS: Language['level'][] = ['Natif', 'Courant', 'Intermédiaire', 'Débutant'];

export default function ExtrasStep({
  languages,
  certifications,
  interests,
  accentColor,
  template,
  onChangeLanguages,
  onChangeCertifications,
  onChangeInterests,
  onChangeAccentColor,
  onChangeTemplate,
}: Props) {
  const [interestInput, setInterestInput] = useState('');

  const addLanguage = () =>
    onChangeLanguages([...languages, { id: generateId(), language: '', level: 'Intermédiaire' }]);

  const removeLanguage = (id: string) =>
    onChangeLanguages(languages.filter((l) => l.id !== id));

  const updateLanguage = (id: string, field: keyof Language, value: string) =>
    onChangeLanguages(languages.map((l) => (l.id === id ? { ...l, [field]: value } : l)));

  const addCertification = () =>
    onChangeCertifications([...certifications, { id: generateId(), name: '', organization: '', date: '' }]);

  const removeCertification = (id: string) =>
    onChangeCertifications(certifications.filter((c) => c.id !== id));

  const updateCertification = (id: string, field: keyof Certification, value: string) =>
    onChangeCertifications(certifications.map((c) => (c.id === id ? { ...c, [field]: value } : c)));

  const addInterest = () => {
    const trimmed = interestInput.trim();
    if (trimmed && !interests.includes(trimmed)) {
      onChangeInterests([...interests, trimmed]);
    }
    setInterestInput('');
  };

  const handleInterestKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addInterest();
    }
  };

  return (
    <div className="step">
      {/* Langues */}
      <div className="step__header-row">
        <h2 className="step__title">Langues</h2>
        <button type="button" className="step__add-btn" onClick={addLanguage}>
          + Ajouter
        </button>
      </div>

      {languages.length === 0 && (
        <p className="step__empty">Aucune langue ajoutée.</p>
      )}

      {languages.map((lang) => (
        <div key={lang.id} className="step__inline-card">
          <input
            type="text"
            className="step__input"
            value={lang.language}
            onChange={(e) => updateLanguage(lang.id, 'language', e.target.value)}
            placeholder="Français"
          />
          <select
            className="step__select"
            value={lang.level}
            onChange={(e) => updateLanguage(lang.id, 'level', e.target.value)}
          >
            {LEVELS.map((lvl) => (
              <option key={lvl} value={lvl}>{lvl}</option>
            ))}
          </select>
          <button type="button" className="step__remove-btn" onClick={() => removeLanguage(lang.id)}>
            ×
          </button>
        </div>
      ))}

      {/* Certifications */}
      <div className="step__header-row step__section-gap">
        <h2 className="step__title">Certifications</h2>
        <button type="button" className="step__add-btn" onClick={addCertification}>
          + Ajouter
        </button>
      </div>

      {certifications.length === 0 && (
        <p className="step__empty">Aucune certification ajoutée.</p>
      )}

      {certifications.map((cert) => (
        <div key={cert.id} className="step__card">
          <div className="step__card-header">
            <span className="step__card-number">{cert.name || 'Certification'}</span>
            <button type="button" className="step__remove-btn" onClick={() => removeCertification(cert.id)}>
              Supprimer
            </button>
          </div>
          <div className="step__row">
            <label className="step__field">
              <span className="step__label">Nom</span>
              <input
                type="text"
                className="step__input"
                value={cert.name}
                onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                placeholder="AWS Solutions Architect"
              />
            </label>
            <label className="step__field">
              <span className="step__label">Organisme</span>
              <input
                type="text"
                className="step__input"
                value={cert.organization}
                onChange={(e) => updateCertification(cert.id, 'organization', e.target.value)}
                placeholder="Amazon Web Services"
              />
            </label>
            <label className="step__field">
              <span className="step__label">Date</span>
              <input
                type="month"
                className="step__input"
                value={cert.date}
                onChange={(e) => updateCertification(cert.id, 'date', e.target.value)}
              />
            </label>
          </div>
        </div>
      ))}

      {/* Centres d'intérêt */}
      <h2 className="step__title step__section-gap">Centres d'intérêt</h2>

      <div className="step__tags">
        {interests.map((interest) => (
          <span key={interest} className="step__tag">
            {interest}
            <button
              type="button"
              className="step__tag-remove"
              onClick={() => onChangeInterests(interests.filter((i) => i !== interest))}
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="step__input"
        value={interestInput}
        onChange={(e) => setInterestInput(e.target.value)}
        onKeyDown={handleInterestKey}
        onBlur={addInterest}
        placeholder="Sport, Voyages, Bénévolat..."
      />

      {/* Template */}
      <h2 className="step__title step__section-gap">Template du CV</h2>
      <div className="step__template-grid">
        {TEMPLATES.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`step__template-card ${template === t.value ? 'step__template-card--active' : ''}`}
            onClick={() => onChangeTemplate(t.value)}
          >
            <span className="step__template-name">{t.label}</span>
            <span className="step__template-desc">{t.desc}</span>
          </button>
        ))}
      </div>

      {/* Couleur d'accent */}
      <h2 className="step__title step__section-gap">Couleur du CV</h2>
      <div className="step__color-grid">
        {ACCENT_COLORS.map((c) => (
          <button
            key={c.value}
            type="button"
            className={`step__color-swatch ${accentColor === c.value ? 'step__color-swatch--active' : ''}`}
            style={{ '--swatch-color': c.hex } as React.CSSProperties}
            onClick={() => onChangeAccentColor(c.value)}
            title={c.label}
          >
            <span className="step__color-dot" />
            <span className="step__color-name">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
