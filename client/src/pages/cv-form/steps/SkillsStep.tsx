import { useState } from 'react';

interface Props {
  technicalSkills: string[];
  softSkills: string[];
  onChangeTechnical: (skills: string[]) => void;
  onChangeSoft: (skills: string[]) => void;
}

function TagInput({ tags, onChange, placeholder }: { tags: string[]; onChange: (t: string[]) => void; placeholder: string }) {
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

  const removeTag = (tag: string) => onChange(tags.filter((t) => t !== tag));

  return (
    <div className="step__tag-input-wrapper">
      <div className="step__tags">
        {tags.map((tag) => (
          <span key={tag} className="step__tag">
            {tag}
            <button type="button" className="step__tag-remove" onClick={() => removeTag(tag)}>×</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        className="step__input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addTag}
        placeholder={tags.length === 0 ? placeholder : 'Ajouter...'}
      />
    </div>
  );
}

export default function SkillsStep({ technicalSkills, softSkills, onChangeTechnical, onChangeSoft }: Props) {
  return (
    <div className="step">
      <h2 className="step__title">Compétences</h2>

      <div className="step__field">
        <span className="step__label">Compétences techniques</span>
        <p className="step__hint">Appuyez sur Entrée pour ajouter chaque compétence</p>
        <TagInput
          tags={technicalSkills}
          onChange={onChangeTechnical}
          placeholder="React, TypeScript, Node.js..."
        />
      </div>

      <div className="step__field">
        <span className="step__label">Compétences transversales (soft skills)</span>
        <p className="step__hint">Appuyez sur Entrée pour ajouter chaque compétence</p>
        <TagInput
          tags={softSkills}
          onChange={onChangeSoft}
          placeholder="Leadership, Communication, Gestion de projet..."
        />
      </div>
    </div>
  );
}
