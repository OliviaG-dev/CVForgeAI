import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CVData, PersonalInfo, Experience, Education, Language, Certification, AccentColor } from '../../types/cv';
import { emptyCVData } from '../../types/cv';
import PersonalInfoStep from './steps/PersonalInfoStep.js';
import ExperienceStep from './steps/ExperienceStep.js';
import EducationStep from './steps/EducationStep.js';
import SkillsStep from './steps/SkillsStep.js';
import ExtrasStep from './steps/ExtrasStep.js';
import './CVForm.css';

const STEPS = [
  { label: 'Infos personnelles', key: 'personal' },
  { label: 'Expériences', key: 'experience' },
  { label: 'Formation', key: 'education' },
  { label: 'Compétences', key: 'skills' },
  { label: 'Extras', key: 'extras' },
] as const;

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export default function CVForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<CVData>(emptyCVData);
  const [generating, setGenerating] = useState(false);

  const updateData = <K extends keyof CVData>(key: K, value: CVData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/cv/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Erreur serveur');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV-${data.personalInfo.firstName}-${data.personalInfo.lastName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
    } finally {
      setGenerating(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <PersonalInfoStep
            data={data.personalInfo}
            onChange={(v: PersonalInfo) => updateData('personalInfo', v)}
          />
        );
      case 1:
        return (
          <ExperienceStep
            data={data.experiences}
            onChange={(v: Experience[]) => updateData('experiences', v)}
          />
        );
      case 2:
        return (
          <EducationStep
            data={data.education}
            onChange={(v: Education[]) => updateData('education', v)}
          />
        );
      case 3:
        return (
          <SkillsStep
            technicalSkills={data.technicalSkills}
            softSkills={data.softSkills}
            onChangeTechnical={(v: string[]) => updateData('technicalSkills', v)}
            onChangeSoft={(v: string[]) => updateData('softSkills', v)}
          />
        );
      case 4:
        return (
          <ExtrasStep
            languages={data.languages}
            certifications={data.certifications}
            interests={data.interests}
            accentColor={data.accentColor}
            onChangeLanguages={(v: Language[]) => updateData('languages', v)}
            onChangeCertifications={(v: Certification[]) => updateData('certifications', v)}
            onChangeInterests={(v: string[]) => updateData('interests', v)}
            onChangeAccentColor={(v: AccentColor) => updateData('accentColor', v)}
          />
        );
      default:
        return null;
    }
  };

  const isLast = currentStep === STEPS.length - 1;

  return (
    <main className="cvform">
      <header className="cvform__header">
        <button type="button" className="cvform__back" onClick={() => navigate('/')}>
          <span className="cvform__back-arrow">&#8592;</span>
          Accueil
        </button>
        <div className="cvform__header-center">
          <h1 className="cvform__title">Créer mon CV</h1>
          <p className="cvform__header-hint">Étape {currentStep + 1} sur {STEPS.length}</p>
        </div>
      </header>

      <nav className="cvform__stepper">
        {STEPS.map((step, i) => (
          <button
            key={step.key}
            type="button"
            className={`cvform__step ${i === currentStep ? 'cvform__step--active' : ''} ${i < currentStep ? 'cvform__step--done' : ''}`}
            onClick={() => setCurrentStep(i)}
          >
            <span className="cvform__step-indicator">
              {i < currentStep ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              ) : (
                <span className="cvform__step-dot" />
              )}
            </span>
            <span className="cvform__step-label">{step.label}</span>
          </button>
        ))}
      </nav>

      <div className="cvform__body" key={currentStep}>
        {renderStep()}
      </div>

      <footer className="cvform__footer">
        <button
          type="button"
          className="cvform__btn cvform__btn--secondary"
          onClick={prev}
          disabled={currentStep === 0}
        >
          <span className="cvform__btn-arrow">&#8592;</span>
          Précédent
        </button>
        {isLast ? (
          <button
            type="button"
            className="cvform__btn cvform__btn--primary cvform__btn--generate"
            onClick={handleSubmit}
            disabled={generating}
          >
            {generating ? 'Génération en cours...' : 'Générer mon CV'}
            {!generating && <span className="cvform__btn-icon">&#10024;</span>}
          </button>
        ) : (
          <button
            type="button"
            className="cvform__btn cvform__btn--primary"
            onClick={next}
          >
            Suivant
            <span className="cvform__btn-arrow">&#8594;</span>
          </button>
        )}
      </footer>
    </main>
  );
}
