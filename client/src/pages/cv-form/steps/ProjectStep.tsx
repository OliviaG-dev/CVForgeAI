import { useState, useCallback, useEffect } from 'react';
import { ChevronDownIcon, TrashIcon } from '../../../components/icons';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import type { Project } from '../../../types/cv';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://cvforgeai.onrender.com' : 'http://localhost:3001');

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

function formatMonth(ym: string): string {
  if (!ym) return '';
  const [y, m] = ym.split('-');
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
  const mi = parseInt(m || '1', 10) - 1;
  return `${months[mi] || m} ${y}`;
}

function formatDateRange(start?: string, end?: string): string {
  if (!start) return '';
  if (end) return `${formatMonth(start)} - ${formatMonth(end)}`;
  return formatMonth(start);
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
  const [improvingId, setImprovingId] = useState<string | null>(null);
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const toggleOpen = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const add = () => {
    const newProj = emptyProject();
    onChange([...data, newProj]);
    setOpenIds((prev) => new Set(prev).add(newProj.id));
  };

  const remove = (id: string) => {
    onChange(data.filter((p) => p.id !== id));
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDeleteConfirmId(null);
  };

  const projToDelete = deleteConfirmId ? data.find((p) => p.id === deleteConfirmId) : null;
  const deleteLabel = projToDelete?.name || 'ce projet';

  useEffect(() => {
    if (!deleteConfirmId) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDeleteConfirmId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteConfirmId]);

  const handleImproveDescription = async (id: string) => {
    const proj = data.find((p) => p.id === id);
    const text = (proj?.description || '').trim();
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
        onChange(data.map((p) => (p.id === id ? { ...p, description: improved } : p)));
      }
    } catch (err) {
      console.error('Erreur amélioration description:', err);
    } finally {
      setImprovingId(null);
    }
  };

  const update = (id: string, field: keyof Project, value: string) => {
    onChange(data.map((p) => {
      if (p.id !== id) return p;
      const next = { ...p, [field]: value };
      if (field === 'startDate' && value && p.endDate && p.endDate < value) {
        next.endDate = value;
      }
      if (field === 'endDate' && value && p.startDate && value < p.startDate) {
        return p;
      }
      return next;
    }));
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

      {displayed.map((proj, i) => {
        const isOpen = openIds.has(proj.id);
        const main = proj.name || `Projet ${i + 1}`;
        const dates = formatDateRange(proj.startDate, proj.endDate);
        return (
        <div key={proj.id} className={`step__card step__card--accordion ${isOpen ? 'step__card--open' : ''}`}>
          <div
            className="step__card-header step__card-header--clickable"
            onClick={() => toggleOpen(proj.id)}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onKeyDown={(e) => e.key === 'Enter' && toggleOpen(proj.id)}
          >
            <div className="step__card-header-content">
              <span className="step__card-number">{main}</span>
              {dates && <span className="step__card-dates">{dates}</span>}
            </div>
            <div className="step__card-header-actions">
              <ChevronDownIcon className="step__card-chevron" size={18} open={isOpen} />
              <button
                type="button"
                className="step__remove-btn step__remove-btn--icon"
                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(proj.id); }}
                aria-label="Supprimer ce projet"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          </div>

          <div className="step__card-body">
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
            <div className="step__field-header">
              <span className="step__label">Description</span>
              {improvingId === proj.id && (
                <span className="step__improve-loading-text">Reformulation IA en cours…</span>
              )}
              <button
                type="button"
                className={`step__improve-btn${improvingId === proj.id ? ' step__improve-btn--loading' : ''}`}
                onClick={() => handleImproveDescription(proj.id)}
                disabled={improvingId !== null || !proj.description?.trim()}
                title="Améliorer le texte avec l'IA"
              >
                {improvingId === proj.id ? (
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
                min={proj.startDate || undefined}
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

          <div className="step__card-validate">
            <button
              type="button"
              className="step__validate-btn"
              onClick={(e) => { e.stopPropagation(); toggleOpen(proj.id); }}
            >
              Valider
            </button>
          </div>
          </div>
        </div>
        );
      })}

      {data.length > 0 && (
        <button type="button" className="step__add-btn step__add-btn--bottom" onClick={add}>
          + Ajouter un projet
        </button>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && remove(deleteConfirmId)}
        title="Supprimer ce projet ?"
        itemLabel={deleteLabel}
      />
    </div>
  );
}
