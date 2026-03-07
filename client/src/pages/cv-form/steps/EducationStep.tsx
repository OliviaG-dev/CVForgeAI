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
});

export default function EducationStep({ data, onChange }: Props) {
  const add = () => onChange([...data, emptyEducation()]);

  const remove = (id: string) => onChange(data.filter((e) => e.id !== id));

  const update = (id: string, field: keyof Education, value: string) => {
    onChange(data.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

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

      {data.map((edu, i) => (
        <div key={edu.id} className="step__card">
          <div className="step__card-header">
            <span className="step__card-number">Formation {i + 1}</span>
            <button type="button" className="step__remove-btn" onClick={() => remove(edu.id)}>
              Supprimer
            </button>
          </div>

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
        </div>
      ))}
    </div>
  );
}
