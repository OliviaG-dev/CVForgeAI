# CVForge AI

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-24-00D9FF?logo=puppeteer&logoColor=white)

CVForge AI est une application web moderne qui permet de **générer automatiquement un CV professionnel** grâce à l'intelligence artificielle.

L'objectif est de simplifier la création de CV en transformant quelques informations simples (expérience, compétences, formation) en un CV structuré, optimisé et prêt à être envoyé aux recruteurs.

## Fonctionnalités

- **Génération automatique de CV** : créez un CV complet en quelques secondes à partir de vos informations.
- **Prévisualisation en temps réel** : visualisez votre CV au fur et à mesure de la saisie.
- **Amélioration intelligente** : reformulation des expériences et projets (mode standard ou **profil senior** avec puces structurées).
- **Templates** : Classique, **Classique dev** (compétences par thème), Créatif (2 colonnes + photo).
- **Export PDF** : téléchargez votre CV dans un format propre et professionnel (Puppeteer).
- **Accordéons** : expériences, projets et formations avec dates et **durée automatique** (ex. `2 ans et 3 mois`).
- **Format profil senior** : puces `●`, titres en gras gris avant `:` pour les descriptions d'expériences et de projets.
- **Compétences clés (dev)** : regroupement automatique (Front-end, Mobile, Back-end & API, Tests, DevOps, IA, Méthodologies…).
- **Langues** : pour l'anglais (Natif / Courant / Intermédiaire), cases d'usage pro (Professionnel, Équipe internationale, Daily & Syncs techniques).
- **Mise en page dev** : espacement harmonieux de l'en-tête, **expériences à partir de la page 2** sur le template classique dev.
- **Ville discrète** : entreprise / école en gris moyen, ville en petit gris clair.
- **Déduplication des compétences** : fusion automatique des doublons (React/react, Node.js/nodejs, etc.).
- **Optimisation ATS** : mots-clés cachés injectés dans le PDF.
- **Interface responsive** : boutons en icônes sur mobile/tablette.

## Technologies

| Catégorie | Technologies |
|-----------|-------------|
| Frontend | React, TypeScript, Vite, Vitest |
| Backend | Node.js, Express, TypeScript, Vitest |
| IA | Google Gemini 2.5 Flash (gratuit) |
| PDF | Puppeteer (Chrome headless) |
| CI | GitHub Actions |

## Structure du projet

```
cvforge-ai/
├── .github/workflows/      # CI (lint, typecheck, tests, build)
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/cv-form/  # Formulaire multi-étapes + aperçu PDF
│   │   ├── types/          # Types CV + langues (englishContexts)
│   │   └── utils/          # skills, language, dateDuration, cvDraftStorage
│   └── package.json
│
├── server/                 # Backend Express
│   ├── src/
│   │   ├── data/           # devSkillCategories.json
│   │   ├── routes/cv.ts
│   │   ├── services/       # ai.ts, pdf.ts
│   │   ├── templates/cv.ts # HTML PDF (classic, classic_dev, creative)
│   │   └── utils/          # classifyDevSkills, descriptionHtml, dateDuration…
│   ├── puppeteer.config.cjs
│   └── package.json
│
├── package.json            # Scripts racine (dev, ci, test)
└── README.md
```

## Installation

```bash
git clone https://github.com/OliviaG-dev/CVForgeAI.git
cd cvforge-ai

npm run install:all

cd server && npx puppeteer browsers install chrome && cd ..

cp server/.env.example server/.env
# Ajouter GEMINI_API_KEY : https://aistudio.google.com/apikey
```

## Lancement

```bash
npm run dev
# Client : http://localhost:5173
# API   : http://localhost:3001
```

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/health` | Santé du serveur |
| `POST` | `/api/cv/generate` | Générer un CV (JSON) |
| `POST` | `/api/cv/improve` | Améliorer une description (`senior: true` pour puces profil senior) |
| `POST` | `/api/cv/pdf` | Générer le PDF |

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Client + serveur en parallèle |
| `npm run build` | Build production du client |
| `npm run lint` | ESLint (client) |
| `npm run typecheck` | TypeScript serveur (`tsc --noEmit`) |
| `npm run test` | Tests Vitest (client + server) |
| `npm run ci` | Lint + typecheck + tests + build client |
| `npm run install:all` | Installe client + server |

Serveur : `npm run build --prefix server` (Chrome + `tsc` pour prod).

Tests unitaires ciblés :

- **Durées** : `dateDuration` (mois inclusifs, poste actuel, formation en cours)
- **Puces / descriptions** : `descriptionHtml` (format senior, échappement HTML)
- **Langues** : `formatLanguage` (PDF), `language` (formulaire anglais)
- **Compétences dev** : `classifyDevSkills` + `devSkillCategories.json`

## CI/CD

Workflow `.github/workflows/ci.yml` sur `push` / `pull_request` vers `master` / `main` :

1. `npm ci` (client + server)
2. Lint client
3. Typecheck server
4. Tests server + client (Vitest)
5. Build client

En local : `npm run ci`

Recommandé sur GitHub : **ruleset** sur `master` (PR obligatoire + statut CI vert).

## Déploiement (Render)

- **Root Directory** : `server` (backend)
- **Build** : `npm install && npm run build`
- **Start** : `npm run start`

`puppeteer.config.cjs` : cache Chrome pour le PDF en production.

## Objectif du projet

- Intégration IA (Gemini)
- App React + API Express en monorepo
- PDF serveur (Puppeteer)
- Formulaires complexes (accordéons, modales, brouillon localStorage)
- Logique métier testée (utils + CI)

## Licence

Projet personnel — tous droits réservés.
