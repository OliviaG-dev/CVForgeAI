import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CVData, PersonalInfo, Experience, Education, Language, Certification } from '../../types/cv';
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

export default function CVForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<CVData>(emptyCVData);

  const updateData = <K extends keyof CVData>(key: K, value: CVData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const next = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleSubmit = () => {
    console.log('CV Data:', data);
    // TODO: envoyer au serveur pour génération IA
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
            onChangeLanguages={(v: Language[]) => updateData('languages', v)}
            onChangeCertifications={(v: Certification[]) => updateData('certifications', v)}
            onChangeInterests={(v: string[]) => updateData('interests', v)}
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
          ← Accueil
        </button>
        <h1 className="cvform__title">Créer mon CV</h1>
      </header>

      <nav className="cvform__stepper">
        {STEPS.map((step, i) => (
          <button
            key={step.key}
            type="button"
            className={`cvform__step ${i === currentStep ? 'cvform__step--active' : ''} ${i < currentStep ? 'cvform__step--done' : ''}`}
            onClick={() => setCurrentStep(i)}
          >
            <span className="cvform__step-number">{i < currentStep ? '✓' : i + 1}</span>
            <span className="cvform__step-label">{step.label}</span>
          </button>
        ))}
      </nav>

      <div className="cvform__body">
        {renderStep()}
      </div>

      <footer className="cvform__footer">
        <button
          type="button"
          className="cvform__btn cvform__btn--secondary"
          onClick={prev}
          disabled={currentStep === 0}
        >
          Précédent
        </button>
        {isLast ? (
          <button
            type="button"
            className="cvform__btn cvform__btn--primary"
            onClick={handleSubmit}
          >
            Générer mon CV
          </button>
        ) : (
          <button
            type="button"
            className="cvform__btn cvform__btn--primary"
            onClick={next}
          >
            Suivant
          </button>
        )}
      </footer>
    </main>
  );
}
