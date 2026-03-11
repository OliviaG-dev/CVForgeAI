import { useState, useRef } from 'react';
import type { PersonalInfo } from '../../../types/cv';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

interface Props {
  data: PersonalInfo;
  onChange: (data: PersonalInfo) => void;
}

function resizeImage(file: File, maxSize: number): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > height) {
          if (width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
        } else {
          if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function PersonalInfoStep({ data, onChange }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [improving, setImproving] = useState(false);

  const update = (field: keyof PersonalInfo, value: string) => {
    onChange({ ...data, [field]: value });
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const base64 = await resizeImage(file, 300);
    onChange({ ...data, photo: base64 });
  };

  const handleImproveSummary = async () => {
    const text = (data.summary || '').trim();
    if (!text) return;
    setImproving(true);
    try {
      const res = await fetch(`${API_URL}/api/cv/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      const { improved } = await res.json();
      if (improved) onChange({ ...data, summary: improved });
    } catch (err) {
      console.error('Erreur amélioration résumé:', err);
    } finally {
      setImproving(false);
    }
  };

  return (
    <div className="step">
      <h2 className="step__title">Informations personnelles</h2>

      <div className="step__card">
        <div className="step__photo-row">
          <div className="step__photo-preview" onClick={() => fileRef.current?.click()}>
            {data.photo ? (
              <img src={data.photo} alt="Photo" className="step__photo-img" />
            ) : (
              <span className="step__photo-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Photo
              </span>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="step__photo-file"
              onChange={handlePhotoChange}
            />
          </div>
          <div className="step__photo-fields">
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
          </div>
          {data.photo && (
            <button
              type="button"
              className="step__photo-remove"
              onClick={() => onChange({ ...data, photo: '' })}
              title="Supprimer la photo"
            >×</button>
          )}
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
          <div className="step__field-header">
            <span className="step__label">Résumé / Présentation</span>
            {improving && (
              <span className="step__improve-loading-text">Reformulation IA en cours…</span>
            )}
            <button
              type="button"
              className={`step__improve-btn${improving ? ' step__improve-btn--loading' : ''}`}
              onClick={handleImproveSummary}
              disabled={improving || !data.summary?.trim()}
              title="Améliorer le texte avec l'IA"
            >
              {improving ? (
                <span className="step__improve-btn-loading" aria-label="Chargement en cours">
                  <span className="step__improve-btn-dot" />
                  <span className="step__improve-btn-dot" />
                  <span className="step__improve-btn-dot" />
                </span>
              ) : (
                "Améliorer avec l'IA"
              )}
            </button>
          </div>
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
