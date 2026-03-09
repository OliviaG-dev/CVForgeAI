import { useState } from 'react';
import type { Project } from '../../../types/cv';

interface Props {
  data: Project[];
  onChange: (data: Project[]) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const emptyProject: () => Project = () => ({
  id: generateId(),
  name: '',
  description: '',
  url: '',
  startDate: '',
  endDate: '',
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

function sortByDateDesc(items: Project[]): Project[] {
  return [...items].sort((a, b) => {
    const dateA = a.startDate || '';
    const dateB = b.startDate || '';
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.localeCompare(dateA);
  });
}

export default function ProjectStep({ data, onChange }: Props) {
  const [autoSort, setAutoSort] = useState(true);

  const add = () => onChange([...data, emptyProject()]);

  const remove = (id: string) => onChange(data.filter((p) => p.id !== id));

  const update = (id: string, field: keyof Project, value: string) => {
    onChange(data.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const updateSkills = (id: string, field: 'technicalSkills' | 'tools' | 'softSkills', value: string[]) => {
    onChange(data.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const displayed = autoSort ? sortByDateDesc(data) : data;

  return (
    <div className="step">
      <div className="step__header-row">
        <h2 className="step__title">Projets</h2>
        <button type="button" className="step__add-btn" onClick={add}>
          + Ajouter
        </button>
      </div>

      {data.length > 1 && (
        <label className="step__sort-toggle">
          <input
            type="checkbox"
            checked={autoSort}
            onChange={(e) => setAutoSort(e.target.checked)}
          />
          <span>Trier par date (plus récent en premier)</span>
        </label>
      )}

      {data.length === 0 && (
        <p className="step__empty">Aucun projet ajouté.<br/>Cliquez sur &laquo; + Ajouter &raquo; pour commencer.</p>
      )}

      {displayed.map((proj, i) => (
        <div key={proj.id} className="step__card">
          <div className="step__card-header">
            <span className="step__card-number">Projet {i + 1}</span>
            <button type="button" className="step__remove-btn" onClick={() => remove(proj.id)}>
              Supprimer
            </button>
          </div>

          <label className="step__field">
            <span className="step__label">Nom du projet *</span>
            <input
              type="text"
              className="step__input"
              value={proj.name}
              onChange={(e) => update(proj.id, 'name', e.target.value)}
              placeholder="Mon application web"
            />
          </label>

          <label className="step__field">
            <span className="step__label">Description</span>
            <textarea
              className="step__textarea"
              value={proj.description}
              onChange={(e) => update(proj.id, 'description', e.target.value)}
              placeholder="Décrivez le projet, son objectif et vos contributions..."
              rows={3}
            />
          </label>

          <div className="step__row">
            <label className="step__field">
              <span className="step__label">Lien (optionnel)</span>
              <input
                type="url"
                className="step__input"
                value={proj.url}
                onChange={(e) => update(proj.id, 'url', e.target.value)}
                placeholder="https://github.com/mon-projet"
              />
            </label>
            <label className="step__field">
              <span className="step__label">Date de début</span>
              <input
                type="month"
                className="step__input"
                value={proj.startDate}
                onChange={(e) => update(proj.id, 'startDate', e.target.value)}
              />
            </label>
            <label className="step__field">
              <span className="step__label">Date de fin</span>
              <input
                type="month"
                className="step__input"
                value={proj.endDate}
                onChange={(e) => update(proj.id, 'endDate', e.target.value)}
              />
            </label>
          </div>

          <div className="exp-skills">
            <div className="exp-skills__header">
              <span className="step__label">Compétences associées</span>
              <p className="step__hint">Ajoutées automatiquement à la section Compétences</p>
            </div>
            <div className="exp-skills__grid">
              <div className="exp-skills__category">
                <span className="exp-skills__cat-label">Techniques</span>
                <SkillTagInput
                  tags={proj.technicalSkills}
                  onChange={(v) => updateSkills(proj.id, 'technicalSkills', v)}
                  placeholder="React, Python..."
                />
              </div>
              <div className="exp-skills__category">
                <span className="exp-skills__cat-label">Outils</span>
                <SkillTagInput
                  tags={proj.tools}
                  onChange={(v) => updateSkills(proj.id, 'tools', v)}
                  placeholder="Firebase, Vercel..."
                />
              </div>
              <div className="exp-skills__category">
                <span className="exp-skills__cat-label">Transversales</span>
                <SkillTagInput
                  tags={proj.softSkills}
                  onChange={(v) => updateSkills(proj.id, 'softSkills', v)}
                  placeholder="Autonomie..."
                />
              </div>
            </div>
          </div>
        </div>
      ))}

      {data.length > 0 && (
        <button type="button" className="step__add-btn step__add-btn--bottom" onClick={add}>
          + Ajouter un projet
        </button>
      )}
    </div>
  );
}
