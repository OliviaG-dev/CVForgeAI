import { useState } from 'react';
import type { Experience } from '../../../types/cv';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://cvforgeai.onrender.com' : 'http://localhost:3001');

interface Props {
  data: Experience[];
  onChange: (data: Experience[]) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const emptyExperience: () => Experience = () => ({
  id: generateId(),
  position: '',
  company: '',
  city: '',
  startDate: '',
  endDate: '',
  current: false,
  description: '',
  projectLink: '',
  technicalSkills: [],
  tools: [],
  softSkills: [],
});

function SkillTagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
  const [input, setInput] = useState('');

  const addTag = () => {
    const trimmed = input.trim();
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
    if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  };

  return (
    <div className="exp-skills__tag-input">
      <div className="exp-skills__tags">
        {tags.map((tag) => (
          <span key={tag} className="exp-skills__tag">
            {tag}
            <button type="button" className="exp-skills__tag-remove" onClick={() => onChange(tags.filter((t) => t !== tag))}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="step__input exp-skills__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : 'Ajouter...'}
      />
    </div>
  );
}

function sortByDateDesc(items: Experience[]): Experience[] {
  return [...items].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    const dateA = a.startDate || '';
    const dateB = b.startDate || '';
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.localeCompare(dateA);
  });
}

export default function ExperienceStep({ data, onChange }: Props) {
  const [improvingId, setImprovingId] = useState<string | null>(null);

  const add = () => onChange([...data, emptyExperience()]);

  const remove = (id: string) => onChange(data.filter((e) => e.id !== id));

  const handleImproveDescription = async (id: string) => {
    const exp = data.find((e) => e.id === id);
    const text = (exp?.description || '').trim();
    if (!text) return;
    setImprovingId(id);
    try {
      const res = await fetch(`${API_URL}/api/cv/improve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: text }),
      });
      if (!res.ok) throw new Error('Erreur serveur');
      const { improved } = await res.json();
      if (improved) {
        onChange(data.map((e) => (e.id === id ? { ...e, description: improved } : e)));
      }
    } catch (err) {
      console.error('Erreur amélioration description:', err);
    } finally {
      setImprovingId(null);
    }
  };

  const update = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange(data.map((e) => {
      if (e.id !== id) return e;
      const next = { ...e, [field]: value };
      if (field === 'startDate' && typeof value === 'string' && value && e.endDate && e.endDate < value) {
        next.endDate = value;
      }
      if (field === 'endDate' && typeof value === 'string' && value && e.startDate && value < e.startDate) {
        return e;
      }
      return next;
    }));
  };

  const updateSkills = (id: string, field: 'technicalSkills' | 'tools' | 'softSkills', value: string[]) => {
    onChange(data.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const sorted = sortByDateDesc(data);

  return (
    <div className="step">
      <div className="step__header-row">
        <h2 className="step__title">Expériences professionnelles</h2>
        <button type="button" className="step__add-btn" onClick={add}>
          + Ajouter
        </button>
      </div>

      {data.length === 0 && (
        <p className="step__empty">Aucune expérience ajoutée.<br/>Cliquez sur &laquo; + Ajouter &raquo; pour commencer.</p>
      )}

      {sorted.map((exp, i) => (
        <div key={exp.id} className="step__card">
          <div className="step__card-header">
            <span className="step__card-number">Expérience {i + 1}</span>
            <button type="button" className="step__remove-btn" onClick={() => remove(exp.id)}>
              Supprimer
            </button>
          </div>

          <div className="step__row">
            <label className="step__field">
              <span className="step__label">Poste *</span>
              <input
                type="text"
                className="step__input"
                value={exp.position}
                onChange={(e) => update(exp.id, 'position', e.target.value)}
                placeholder="Développeur Frontend"
              />
            </label>
            <label className="step__field">
              <span className="step__label">Entreprise *</span>
              <input
                type="text"
                className="step__input"
                value={exp.company}
                onChange={(e) => update(exp.id, 'company', e.target.value)}
                placeholder="TechCorp"
              />
            </label>
          </div>

          <div className="step__row">
            <label className="step__field">
              <span className="step__label">Ville</span>
              <input
                type="text"
                className="step__input"
                value={exp.city}
                onChange={(e) => update(exp.id, 'city', e.target.value)}
                placeholder="Paris"
              />
            </label>
            <label className="step__field">
              <span className="step__label">Date de début</span>
              <input
                type="month"
                className="step__input"
                value={exp.startDate}
                onChange={(e) => update(exp.id, 'startDate', e.target.value)}
              />
            </label>
            <label className="step__field">
              <span className="step__label">Date de fin</span>
              <input
                type="month"
                className="step__input"
                value={exp.endDate}
                onChange={(e) => update(exp.id, 'endDate', e.target.value)}
                disabled={exp.current}
                min={exp.startDate || undefined}
              />
            </label>
          </div>

          <label className="step__checkbox">
            <input
              type="checkbox"
              checked={exp.current}
              onChange={(e) => update(exp.id, 'current', e.target.checked)}
            />
            <span>Poste actuel</span>
          </label>

          <label className="step__field">
            <div className="step__field-header">
              <span className="step__label">Description des missions</span>
              {improvingId === exp.id && (
                <span className="step__improve-loading-text">Reformulation IA en cours…</span>
              )}
              <button
                type="button"
                className={`step__improve-btn${improvingId === exp.id ? ' step__improve-btn--loading' : ''}`}
                onClick={() => handleImproveDescription(exp.id)}
                disabled={improvingId !== null || !exp.description?.trim()}
                title="Améliorer le texte avec l'IA"
              >
                {improvingId === exp.id ? (
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
              value={exp.description}
              onChange={(e) => update(exp.id, 'description', e.target.value)}
              placeholder="Décrivez vos missions et réalisations principales..."
              rows={4}
            />
          </label>

          <label className="step__field">
            <span className="step__label">Lien vers le projet (optionnel)</span>
            <input
              type="url"
              className="step__input"
              value={exp.projectLink}
              onChange={(e) => update(exp.id, 'projectLink', e.target.value)}
              placeholder="https://mon-projet.com"
            />
          </label>

          <div className="exp-skills">
            <div className="exp-skills__header">
              <span className="step__label">Compétences associées</span>
              <p className="step__hint">Ajoutées automatiquement à la section Compétences</p>
            </div>
            <div className="exp-skills__grid">
              <div className="exp-skills__category">
                <span className="exp-skills__cat-label">Techniques</span>
                <SkillTagInput
                  tags={exp.technicalSkills}
                  onChange={(v) => updateSkills(exp.id, 'technicalSkills', v)}
                  placeholder="React, Node.js..."
                />
              </div>
              <div className="exp-skills__category">
                <span className="exp-skills__cat-label">Outils</span>
                <SkillTagInput
                  tags={exp.tools}
                  onChange={(v) => updateSkills(exp.id, 'tools', v)}
                  placeholder="Git, Docker..."
                />
              </div>
              <div className="exp-skills__category">
                <span className="exp-skills__cat-label">Transversales</span>
                <SkillTagInput
                  tags={exp.softSkills}
                  onChange={(v) => updateSkills(exp.id, 'softSkills', v)}
                  placeholder="Leadership..."
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {data.length > 0 && (
        <button type="button" className="step__add-btn step__add-btn--bottom" onClick={add}>
          + Ajouter une expérience
        </button>
      )}
    </div>
  );
}
