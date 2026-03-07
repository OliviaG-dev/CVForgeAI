import type { Experience } from '../../../types/cv';

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
});

export default function ExperienceStep({ data, onChange }: Props) {
  const add = () => onChange([...data, emptyExperience()]);

  const remove = (id: string) => onChange(data.filter((e) => e.id !== id));

  const update = (id: string, field: keyof Experience, value: string | boolean) => {
    onChange(data.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  return (
    <div className="step">
      <div className="step__header-row">
        <h2 className="step__title">Expériences professionnelles</h2>
        <button type="button" className="step__add-btn" onClick={add}>
          + Ajouter
        </button>
      </div>

      {data.length === 0 && (
        <p className="step__empty">Aucune expérience ajoutée. Cliquez sur "+ Ajouter" pour commencer.</p>
      )}

      {data.map((exp, i) => (
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
            <span className="step__label">Description des missions</span>
            <textarea
              className="step__textarea"
              value={exp.description}
              onChange={(e) => update(exp.id, 'description', e.target.value)}
              placeholder="Décrivez vos missions et réalisations principales..."
              rows={4}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
