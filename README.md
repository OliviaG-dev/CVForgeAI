# CVForge AI

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![Vitest](https://img.shields.io/badge/Vitest-3-6E9F18?logo=vitest&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4?logo=google&logoColor=white)
![Puppeteer](https://img.shields.io/badge/Puppeteer-24-00D9FF?logo=puppeteer&logoColor=white)
![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?logo=githubactions&logoColor=white)
![CD](https://img.shields.io/badge/CD-Render%20%2B%20Vercel-46E3B7?logo=render&logoColor=white)

CVForge AI est une application web moderne qui permet de **générer automatiquement un CV professionnel** grâce à l'intelligence artificielle.

L'objectif est de simplifier la création de CV en transformant quelques informations simples (expérience, compétences, formation) en un CV structuré, optimisé et prêt à être envoyé aux recruteurs.

## Fonctionnalités

- **Génération automatique de CV** : créez un CV complet en quelques secondes à partir de vos informations.
- **Prévisualisation en temps réel** : visualisez votre CV au fur et à mesure de la saisie.
- **Amélioration intelligente** : reformulation des expériences et projets (mode standard ou **profil senior** avec puces structurées).
- **Templates** : Classique, **Classique dev** (compétences par thème), Créatif (2 colonnes + photo).
- **Export PDF** : téléchargez votre CV dans un format propre et professionnel (Puppeteer).
- **Accordéons** : expériences, projets et formations avec dates et **durée automatique** (ex. `2 ans et 3 mois`).
- **Format profil senior** : puces `●`, titres en gras gris avant `:` pour les descriptions d'expériences et de projets (case à cocher explicite).
- **Compétences clés (dev)** : regroupement automatique (Front-end, Mobile, Back-end & API, Tests, DevOps, IA, Méthodologies…).
- **Langues** : pour l'anglais (Natif / Courant / Intermédiaire), cases d'usage pro (Professionnel, Équipe internationale, Daily & Syncs techniques).
- **Mise en page dev** : en-tête compact (nom/prénom plus petits), expériences juste sous les compétences clés, cible 2 pages.
- **Ville discrète** : entreprise / école en gris moyen, ville en petit gris clair.
- **Déduplication des compétences** : fusion automatique des doublons (React/react, Node.js/nodejs, etc.).
- **Optimisation ATS** : mots-clés cachés injectés dans le PDF.
- **Brouillon local** : sauvegarde automatique du formulaire dans `localStorage`.
- **Interface responsive** : boutons en icônes sur mobile/tablette.

## Technologies

| Catégorie | Technologies |
|-----------|-------------|
| Frontend | React, TypeScript, Vite, Vitest |
| Backend | Node.js, Express, TypeScript, Vitest, Supertest |
| IA | Google Gemini 2.5 Flash (gratuit) |
| PDF | Puppeteer (Chrome headless) |
| CI/CD | GitHub Actions (CI) + Render / Vercel auto-deploy (CD) |

## Structure du projet

```
cvforge-ai/
├── .github/workflows/          # CI (lint, typecheck, tests, build)
├── client/                     # Frontend React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/cv-form/      # Formulaire multi-étapes + aperçu PDF
│   │   ├── types/              # Types CV + langues (englishContexts)
│   │   └── utils/              # skills, language, dateDuration, cvDraftStorage
│   │       └── *.test.ts       # Tests Vitest client
│   └── package.json
│
├── server/                     # Backend Express
│   ├── src/
│   │   ├── app.ts              # Factory Express (tests + index)
│   │   ├── data/               # devSkillCategories.json
│   │   ├── routes/cv.ts        # + cv.test.ts (API)
│   │   ├── services/           # ai.ts, pdf.ts (mockés en tests)
│   │   ├── templates/
│   │   │   ├── cv.ts           # HTML PDF (classic, classic_dev, creative)
│   │   │   └── cv.html.test.ts
│   │   ├── test/fixtures/      # cvData.ts (données CV pour tests)
│   │   └── utils/              # + *.test.ts
│   ├── puppeteer.config.cjs
│   └── package.json
│
├── package.json                # Scripts racine (dev, ci, test)
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
| `POST` | `/api/cv/generate` | Générer un CV (JSON) via Gemini |
| `POST` | `/api/cv/improve` | Améliorer une description (`senior: true` pour puces profil senior) |
| `POST` | `/api/cv/pdf` | Générer le PDF (body = données CV complètes) |

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Client + serveur en parallèle |
| `npm run build` | Build production du client |
| `npm run lint` | ESLint (client) |
| `npm run typecheck` | TypeScript serveur (`tsc --noEmit`) |
| `npm run test` | Tests Vitest (server puis client) |
| `npm run ci` | Lint + typecheck + tests + build client |
| `npm run install:all` | Installe client + server |

Ciblés par package :

```bash
npm run test --prefix server    # 45 tests
npm run test --prefix client    # 29 tests
npm run build --prefix server   # Chrome + tsc (prod Render)
```

## Tests

**74 tests Vitest** (45 server + 29 client), exécutés en CI sans Gemini ni Chrome réel (mocks IA/PDF sur les routes).

```bash
npm run test          # les deux packages
npm run ci            # inclut les tests
```

| Couche | Fichiers | Ce qui est vérifié |
|--------|----------|-------------------|
| Utils server | `dateDuration`, `descriptionHtml`, `formatLanguage`, `classifyDevSkills` | Durées inclusives, puces senior, libellés anglais, catégories dev |
| Templates HTML | `templates/cv.html.test.ts` | `classic` / `classic_dev` / `creative`, saut page expériences, durées auto, ville, projets, ATS, échappement HTML |
| API | `routes/cv.test.ts` | Supertest : `/health`, `/generate`, `/improve`, `/pdf`, erreurs 500, `noMargins` créatif |
| Utils client | `language`, `skills`, `dateDuration`, `cvDraftStorage` | Contextes anglais, dédup skills, durées, merge + brouillon `localStorage` |

Fixtures partagées : `server/src/test/fixtures/cvData.ts`.

**Hors scope actuel** (volontaire) : tests composants React, E2E navigateur, appels Gemini/Puppeteer réels en CI.

## CI/CD

Pas de workflow `cd.yml` séparé : la **CD de base** repose sur l’**auto-deploy** Render + Vercel à chaque push sur `master`, après merge d’une PR dont la CI est verte (ruleset recommandé).

| Étape | Outil | Rôle |
|-------|--------|------|
| **CI** | GitHub Actions (`.github/workflows/ci.yml`) | Lint, typecheck, tests, build client sur `push` / `pull_request` |
| **CD** | Render (API) + Vercel (client) | Déploiement automatique sur `master` |

### CI (GitHub Actions)

1. `npm ci` (client + server)
2. Lint client
3. Typecheck server
4. Tests server + client (Vitest)
5. Build client

En local : `npm run ci`

Recommandé : **ruleset** sur `master` (PR obligatoire + statut CI vert avant merge).

### CD (Render + Vercel)

**Render** — backend (`server/`) :

- **Root Directory** : `server`
- **Build** : `npm install && npm run build`
- **Start** : `npm run start`
- **Auto-Deploy** : branche `master`
- Variables : `GEMINI_API_KEY`, etc.
- `puppeteer.config.cjs` : cache Chrome pour le PDF

**Vercel** — frontend (`client/`) :

- **Root Directory** : `client`
- **Build** : `npm run build`
- **Auto-Deploy** : branche `master`
- Variable : `VITE_API_URL` → URL Render (ex. `https://cvforgeai.onrender.com`)

## Objectif du projet

- Intégration IA (Gemini) pour génération et reformulation
- App React + API Express en monorepo
- PDF serveur (Puppeteer) avec templates HTML maintenables
- Formulaires complexes (accordéons, modales, brouillon `localStorage`)
- **Logique métier couverte par tests** (utils, rendu HTML, routes API) et pipeline **CI/CD**

## Licence

Projet personnel — tous droits réservés.
