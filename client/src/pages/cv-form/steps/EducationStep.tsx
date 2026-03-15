import { useState, useCallback, useEffect } from 'react';
import { ChevronDownIcon, TrashIcon } from '../../../components/icons';
import DeleteConfirmModal from '../../../components/DeleteConfirmModal';
import type { Education } from '../../../types/cv';

interface Props {
  data: Education[];
  onChange: (data: Education[]) => void;
}

function generateId() {
  return Math.random().toString(36).substring(2, 9);
}

const emptyEducation: () => Education = () => ({
  id: generateId(),
  degree: '',
  school: '',
  city: '',
  startDate: '',
  endDate: '',
  specialty: '',
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

function sortByDateDesc(items: Education[]): Education[] {
  return [...items].sort((a, b) => {
    const dateA = a.startDate || '';
    const dateB = b.startDate || '';
    if (!dateA && !dateB) return 0;
    if (!dateA) return 1;
    if (!dateB) return -1;
    return dateB.localeCompare(dateA);
  });
}

export default function EducationStep({ data, onChange }: Props) {
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
    const newEdu = emptyEducation();
    onChange([...data, newEdu]);
    setOpenIds((prev) => new Set(prev).add(newEdu.id));
  };

  const remove = (id: string) => {
    onChange(data.filter((e) => e.id !== id));
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDeleteConfirmId(null);
  };

  const eduToDelete = deleteConfirmId ? data.find((e) => e.id === deleteConfirmId) : null;
  const deleteLabel = eduToDelete
    ? [eduToDelete.degree, eduToDelete.school].filter(Boolean).join(' — ') || 'cette formation'
    : '';

  useEffect(() => {
    if (!deleteConfirmId) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDeleteConfirmId(null);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteConfirmId]);

  const update = (id: string, field: keyof Education, value: string) => {
    onChange(data.map((e) => {
      if (e.id !== id) return e;
      const next = { ...e, [field]: value };
      if (field === 'startDate' && value && e.endDate && e.endDate < value) {
        next.endDate = value;
      }
      if (field === 'endDate' && value && e.startDate && value < e.startDate) {
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
        <h2 className="step__title">Formation</h2>
        <button type="button" className="step__add-btn" onClick={add}>
          + Ajouter
        </button>
      </div>

      {data.length === 0 && (
        <p className="step__empty">Aucune formation ajoutée.<br/>Cliquez sur &laquo; + Ajouter &raquo; pour commencer.</p>
      )}

      {sorted.map((edu, i) => {
        const isOpen = openIds.has(edu.id);
        const main = [edu.degree, edu.school].filter(Boolean).join(' — ') || `Formation ${i + 1}`;
        const dates = formatDateRange(edu.startDate, edu.endDate);
        return (
        <div key={edu.id} className={`step__card step__card--accordion ${isOpen ? 'step__card--open' : ''}`}>
          <div
            className="step__card-header step__card-header--clickable"
            onClick={() => toggleOpen(edu.id)}
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            onKeyDown={(e) => e.key === 'Enter' && toggleOpen(edu.id)}
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
                onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(edu.id); }}
                aria-label="Supprimer cette formation"
              >
                <TrashIcon size={14} />
              </button>
            </div>
          </div>

          <div className="step__card-body">
          <div className="step__row">
            <label className="step__field">
              <span className="step__label">Diplôme *</span>
              <input
                type="text"
                className="step__input"
                value={edu.degree}
                onChange={(e) => update(edu.id, 'degree', e.target.value)}
                placeholder="Master Informatique"
              />
            </label>
            <label className="step__field">
              <span className="step__label">Établissement *</span>
              <input
                type="text"
                className="step__input"
                value={edu.school}
                onChange={(e) => update(edu.id, 'school', e.target.value)}
                placeholder="Université Paris-Saclay"
              />
            </label>
          </div>

          <div className="step__row">
            <label className="step__field">
              <span className="step__label">Ville</span>
              <input
                type="text"
                className="step__input"
                value={edu.city}
                onChange={(e) => update(edu.id, 'city', e.target.value)}
                placeholder="Paris"
              />
            </label>
            <label className="step__field">
              <span className="step__label">Date de début</span>
              <input
                type="month"
                className="step__input"
                value={edu.startDate}
                onChange={(e) => update(edu.id, 'startDate', e.target.value)}
              />
            </label>
            <label className="step__field">
              <span className="step__label">Date de fin</span>
              <input
                type="month"
                className="step__input"
                value={edu.endDate}
                onChange={(e) => update(edu.id, 'endDate', e.target.value)}
                min={edu.startDate || undefined}
              />
            </label>
          </div>

          <label className="step__field">
            <span className="step__label">Spécialité / Mention</span>
            <input
              type="text"
              className="step__input"
              value={edu.specialty}
              onChange={(e) => update(edu.id, 'specialty', e.target.value)}
              placeholder="Spécialité IA et Data Science"
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
                  tags={edu.technicalSkills}
                  onChange={(v) => updateSkills(edu.id, 'technicalSkills', v)}
                  placeholder="Python, SQL..."
                />
              </div>
              <div className="exp-skills__category">
                <span className="exp-skills__cat-label">Outils</span>
                <SkillTagInput
                  tags={edu.tools}
                  onChange={(v) => updateSkills(edu.id, 'tools', v)}
                  placeholder="Jupyter, MATLAB..."
                />
              </div>
              <div className="exp-skills__category">
                <span className="exp-skills__cat-label">Transversales</span>
                <SkillTagInput
                  tags={edu.softSkills}
                  onChange={(v) => updateSkills(edu.id, 'softSkills', v)}
                  placeholder="Travail d'équipe..."
                />
              </div>
            </div>
          </div>

          <div className="step__card-validate">
            <button
              type="button"
              className="step__validate-btn"
              onClick={(e) => { e.stopPropagation(); toggleOpen(edu.id); }}
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
          + Ajouter une formation
        </button>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => deleteConfirmId && remove(deleteConfirmId)}
        title="Supprimer cette formation ?"
        itemLabel={deleteLabel}
      />
    </div>
  );
}
