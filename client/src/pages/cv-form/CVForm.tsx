import { useState, useCallback, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import type { CVData, PersonalInfo, Experience, Project, Education, Language, Certification, AccentColor, CVTemplate } from '../../types/cv';
import { emptyCVData } from '../../types/cv';
import { mergeSkillsUnique } from '../../utils/skills';
import { clearCVDraft, loadCVDraft, saveCVDraft } from '../../utils/cvDraftStorage';
import DeleteConfirmModal from '../../components/DeleteConfirmModal';
import PersonalInfoStep from './steps/PersonalInfoStep.js';
import ExperienceStep from './steps/ExperienceStep.js';
import ProjectStep from './steps/ProjectStep.js';
import EducationStep from './steps/EducationStep.js';
import SkillsStep from './steps/SkillsStep.js';
import ExtrasStep from './steps/ExtrasStep.js';
import './CVForm.css';

const STEPS = [
  { label: 'Infos personnelles', key: 'personal' },
  { label: 'Expériences', key: 'experience' },
  { label: 'Projets', key: 'projects' },
  { label: 'Formation', key: 'education' },
  { label: 'Compétences', key: 'skills' },
  { label: 'Extras', key: 'extras' },
] as const;

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://cvforgeai.onrender.com' : 'http://localhost:3001');

const SAVE_DEBOUNCE_MS = 400;

function messageForPdfFetchError(err: unknown): string {
  if (err instanceof TypeError && (err.message === 'Failed to fetch' || err.message.includes('Load failed'))) {
    return import.meta.env.DEV
      ? "L'API n'est pas joignable. Lance le serveur : à la racine du projet, `npm run dev` (client + API), ou `npm run dev --prefix server` (port 3001)."
      : "Impossible de contacter le serveur. Réessaie plus tard.";
  }
  return err instanceof Error ? err.message : 'Erreur réseau';
}

export default function CVForm() {
  const navigate = useNavigate();
  const initialDraft = useMemo(() => loadCVDraft(), []);
  const [currentStep, setCurrentStep] = useState(initialDraft?.step ?? 0);
  const [data, setData] = useState<CVData>(initialDraft?.data ?? emptyCVData);
  const [generating, setGenerating] = useState(false);
  const [previewing, setPreviewing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [coldStartHint, setColdStartHint] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  useEffect(() => {
    if (!previewing && !generating) {
      setColdStartHint(false);
      return;
    }
    const t = setTimeout(() => setColdStartHint(true), 5000);
    return () => clearTimeout(t);
  }, [previewing, generating]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveCVDraft(data, currentStep);
    }, SAVE_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [data, currentStep]);

  const updateData = <K extends keyof CVData>(key: K, value: CVData[K]) => {
    setData((prev) => ({ ...prev, [key]: value }));
  };

  const handleExperiencesChange = useCallback((experiences: Experience[]) => {
    setData((prev) => {
      const expTech = experiences.flatMap((e) => e.technicalSkills);
      const expTools = experiences.flatMap((e) => e.tools);
      const expSoft = experiences.flatMap((e) => e.softSkills);

      return {
        ...prev,
        experiences,
        technicalSkills: mergeSkillsUnique(prev.technicalSkills, expTech),
        tools: mergeSkillsUnique(prev.tools, expTools),
        softSkills: mergeSkillsUnique(prev.softSkills, expSoft),
      };
    });
  }, []);

  const handleProjectsChange = useCallback((projects: Project[]) => {
    setData((prev) => {
      const projTech = projects.flatMap((p) => p.technicalSkills);
      const projTools = projects.flatMap((p) => p.tools);
      const projSoft = projects.flatMap((p) => p.softSkills);

      return {
        ...prev,
        projects,
        technicalSkills: mergeSkillsUnique(prev.technicalSkills, projTech),
        tools: mergeSkillsUnique(prev.tools, projTools),
        softSkills: mergeSkillsUnique(prev.softSkills, projSoft),
      };
    });
  }, []);

  const handleEducationChange = useCallback((education: Education[]) => {
    setData((prev) => {
      const eduTech = education.flatMap((e) => e.technicalSkills);
      const eduTools = education.flatMap((e) => e.tools);
      const eduSoft = education.flatMap((e) => e.softSkills);

      return {
        ...prev,
        education,
        technicalSkills: mergeSkillsUnique(prev.technicalSkills, eduTech),
        tools: mergeSkillsUnique(prev.tools, eduTools),
        softSkills: mergeSkillsUnique(prev.softSkills, eduSoft),
      };
    });
  }, []);

  const next = () => setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setCurrentStep((s) => Math.max(s - 1, 0));

  const handleResetForm = useCallback(() => {
    clearCVDraft();
    setData({
      ...emptyCVData,
      personalInfo: { ...emptyCVData.personalInfo },
    });
    setCurrentStep(0);
  }, []);

  const handlePreview = async () => {
    setPreviewing(true);
    setPreviewUrl(null);
    try {
      const res = await fetch(`${API_URL}/api/cv/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Erreur aperçu PDF:', err);
      alert(messageForPdfFetchError(err));
    } finally {
      setPreviewing(false);
    }
  };

  const closePreviewModal = useCallback(() => {
    setPreviewUrl((url) => {
      if (url) URL.revokeObjectURL(url);
      return null;
    });
  }, []);

  useEffect(() => {
    if (!previewUrl) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePreviewModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [previewUrl, closePreviewModal]);

  const handleSubmit = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/cv/pdf`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur serveur (${res.status})`);
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `CV-${data.personalInfo.firstName}-${data.personalInfo.lastName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Erreur génération PDF:', err);
      alert(messageForPdfFetchError(err));
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
            onChange={handleExperiencesChange}
          />
        );
      case 2:
        return (
          <ProjectStep
            data={data.projects}
            onChange={handleProjectsChange}
          />
        );
      case 3:
        return (
          <EducationStep
            data={data.education}
            onChange={handleEducationChange}
          />
        );
      case 4:
        return (
          <SkillsStep
            technicalSkills={data.technicalSkills}
            tools={data.tools}
            softSkills={data.softSkills}
            atsKeywords={data.atsKeywords}
            onChangeTechnical={(v: string[]) => updateData('technicalSkills', mergeSkillsUnique([], v))}
            onChangeTools={(v: string[]) => updateData('tools', mergeSkillsUnique([], v))}
            onChangeSoft={(v: string[]) => updateData('softSkills', mergeSkillsUnique([], v))}
            onChangeAtsKeywords={(v: string) => updateData('atsKeywords', v)}
          />
        );
      case 5:
        return (
          <ExtrasStep
            languages={data.languages}
            certifications={data.certifications}
            interests={data.interests}
            accentColor={data.accentColor}
            template={data.template}
            onChangeLanguages={(v: Language[]) => updateData('languages', v)}
            onChangeCertifications={(v: Certification[]) => updateData('certifications', v)}
            onChangeInterests={(v: string[]) => updateData('interests', v)}
            onChangeAccentColor={(v: AccentColor) => updateData('accentColor', v)}
            onChangeTemplate={(v: CVTemplate) => updateData('template', v)}
          />
        );
      default:
        return null;
    }
  };

  const isLast = currentStep === STEPS.length - 1;

  return (
    <main
      className="cvform"
      data-bwignore
      data-lpignore="true"
      data-1p-ignore
    >
      <header className="cvform__header">
        <button type="button" className="cvform__back" onClick={() => navigate('/')}>
          <span className="cvform__back-arrow">&#8592;</span>
          Accueil
        </button>
        <div className="cvform__header-center">
          <h1 className="cvform__title">Créer mon CV</h1>
          <p className="cvform__header-hint">Étape {currentStep + 1} sur {STEPS.length}</p>
        </div>
        <button
          type="button"
          className="cvform__reset"
          onClick={() => setResetConfirmOpen(true)}
          aria-label="Réinitialiser le formulaire et le brouillon enregistré"
        >
          Réinitialiser
        </button>
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

      <form
        className="cvform__body"
        key={currentStep}
        autoComplete="off"
        onSubmit={(e) => e.preventDefault()}
      >
        {renderStep()}
      </form>

      {coldStartHint && (
        <p className="cvform__cold-start-hint">
          Première requête : le serveur peut prendre jusqu&apos;à 1 minute à démarrer (hébergement gratuit).
        </p>
      )}
      <footer className="cvform__footer">
        <button
          type="button"
          className="cvform__btn cvform__btn--secondary"
          onClick={prev}
          disabled={currentStep === 0}
          aria-label="Précédent"
        >
          <span className="cvform__btn-arrow">&#8592;</span>
          <span className="cvform__btn-text">Précédent</span>
        </button>
        <button
          type="button"
          className="cvform__btn cvform__btn--preview"
          onClick={handlePreview}
          disabled={previewing}
          aria-label={previewing ? 'Chargement...' : 'Aperçu'}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          <span className="cvform__btn-text">{previewing ? 'Chargement...' : 'Aperçu'}</span>
        </button>
        {isLast ? (
          <button
            type="button"
            className="cvform__btn cvform__btn--primary cvform__btn--generate"
            onClick={handleSubmit}
            disabled={generating}
          >
            {generating ? 'Génération en cours...' : 'Générer mon CV'}
          </button>
        ) : (
          <button
            type="button"
            className="cvform__btn cvform__btn--primary cvform__btn--next"
            onClick={next}
            aria-label="Suivant"
          >
            <span className="cvform__btn-text">Suivant</span>
            <span className="cvform__btn-arrow">&#8594;</span>
          </button>
        )}
      </footer>

      <DeleteConfirmModal
        isOpen={resetConfirmOpen}
        onClose={() => setResetConfirmOpen(false)}
        onConfirm={handleResetForm}
        title="Réinitialiser le formulaire ?"
        description="Toutes les données saisies et le brouillon enregistré dans ce navigateur seront effacés. Cette action est irréversible."
        confirmLabel="Réinitialiser"
      />

      {previewUrl &&
        createPortal(
          <div
            className="cvform__preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Aperçu du CV"
            onClick={closePreviewModal}
          >
            <div
              className="cvform__preview-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={previewUrl}
                title="Aperçu du CV"
                className="cvform__preview-modal-iframe"
              />
              <button
                type="button"
                className="cvform__preview-modal-close"
                onClick={closePreviewModal}
                aria-label="Fermer l'aperçu"
              >
                Fermer
              </button>
            </div>
          </div>,
          document.body
        )}
    </main>
  );
}
