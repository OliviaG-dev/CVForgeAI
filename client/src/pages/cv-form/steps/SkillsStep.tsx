import { useState } from 'react';

interface Props {
  technicalSkills: string[];
  tools: string[];
  softSkills: string[];
  atsKeywords: string;
  onChangeTechnical: (skills: string[]) => void;
  onChangeTools: (tools: string[]) => void;
  onChangeSoft: (skills: string[]) => void;
  onChangeAtsKeywords: (value: string) => void;
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

export default function SkillsStep({ technicalSkills, tools, softSkills, atsKeywords, onChangeTechnical, onChangeTools, onChangeSoft, onChangeAtsKeywords }: Props) {
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
        <span className="step__label">Outils</span>
        <p className="step__hint">Appuyez sur Entrée pour ajouter chaque outil</p>
        <TagInput
          tags={tools}
          onChange={onChangeTools}
          placeholder="Git, Docker, VS Code, Figma, Jira..."
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

      <h2 className="step__title step__section-gap">Optimisation ATS</h2>
      <div className="step__ats-info">
        <p className="step__ats-desc">
          Les recruteurs utilisent des logiciels (ATS) qui scannent automatiquement les CV
          pour filtrer les candidats. Ajoutez ici des mots-clés et phrases liés au poste visé :
          ils seront intégrés dans votre CV de manière <strong>invisible pour le lecteur humain</strong>,
          mais détectables par ces logiciels. Cela augmente vos chances de passer les filtres automatiques.
        </p>
        <p className="step__ats-tip">
          Astuce : copiez-collez les compétences et termes clés de l'offre d'emploi.
        </p>
      </div>
      <label className="step__field">
        <span className="step__label">Mots-clés & phrases cachés</span>
        <textarea
          className="step__textarea"
          value={atsKeywords}
          onChange={(e) => onChangeAtsKeywords(e.target.value)}
          placeholder="Ex : Gestion de projet, Méthodologie Agile, Scrum Master, Python, Machine Learning, Leadership, CI/CD, AWS, DevOps..."
          rows={4}
        />
      </label>
    </div>
  );
}
