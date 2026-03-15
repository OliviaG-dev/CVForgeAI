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
- **Amélioration intelligente** : reformulation des expériences professionnelles pour les rendre plus percutantes.
- **Adaptation à une offre d'emploi** : optimisez votre CV pour une offre spécifique et les systèmes ATS.
- **Export PDF** : téléchargez votre CV dans un format propre et professionnel (Puppeteer).
- **Accordéons** : expériences, projets et formations en accordéon avec dates dans l'en-tête.
- **Déduplication des compétences** : fusion automatique des compétences similaires (React/react, Node.js/nodejs, etc.).
- **Interface responsive** : boutons en icônes sur mobile/tablette.

## Technologies

| Catégorie | Technologies |
|-----------|-------------|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express, TypeScript |
| IA | Google Gemini 2.5 Flash (gratuit) |
| PDF | Puppeteer (Chrome headless) |

## Structure du projet

```
cvforge-ai/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/
│   │   │   ├── icons/      # Icônes SVG (ChevronDown, Trash, Eye...)
│   │   │   └── DeleteConfirmModal.tsx
│   │   ├── pages/
│   │   │   ├── home/       # Page d'accueil
│   │   │   └── cv-form/    # Formulaire et aperçu CV
│   │   ├── utils/
│   │   │   └── skills.ts   # Déduplication des compétences
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── server/                 # Backend Express
│   ├── src/
│   │   ├── routes/
│   │   │   └── cv.ts       # Routes API (génération, amélioration, PDF)
│   │   ├── services/
│   │   │   ├── ai.ts       # Intégration Google Gemini
│   │   │   └── pdf.ts      # Génération PDF (Puppeteer)
│   │   ├── templates/
│   │   │   └── cv.ts       # Templates HTML des CV
│   │   └── index.ts        # Point d'entrée serveur
│   ├── puppeteer.config.cjs  # Config cache Chrome (Render)
│   ├── .env.example
│   ├── tsconfig.json
│   └── package.json
│
├── package.json            # Scripts racine (concurrently)
└── README.md
```

## Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/cvforge-ai.git
cd cvforge-ai

# Installer toutes les dépendances (racine + client + server)
npm run install:all

# Installer Chrome pour Puppeteer (requis pour l'aperçu et l'export PDF)
cd server && npx puppeteer browsers install chrome && cd ..

# Configurer les variables d'environnement du serveur
cp server/.env.example server/.env
# Puis ajouter votre clé API Gemini dans server/.env
# Obtenir une clé gratuite : https://aistudio.google.com/apikey
```

## Lancement

```bash
# Lancer client + serveur en parallèle
npm run dev

# Ou séparément
npm run dev:client    # Frontend sur http://localhost:5173
npm run dev:server    # Backend sur http://localhost:3001
```

## API Endpoints

| Méthode | Route | Description |
|---------|-------|-------------|
| `GET` | `/api/health` | Vérifier que le serveur fonctionne |
| `POST` | `/api/cv/generate` | Générer un CV complet |
| `POST` | `/api/cv/improve` | Améliorer une description |
| `POST` | `/api/cv/pdf` | Générer et télécharger le CV en PDF |

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance client et serveur en parallèle |
| `npm run dev:client` | Lance le frontend Vite |
| `npm run dev:server` | Lance le backend Express |
| `npm run build` | Build de production du client |
| `npm run install:all` | Installe les dépendances client et serveur |

Pour le serveur : `npm run build --prefix server` (installe Chrome + compile TypeScript).

## Déploiement (Render)

Le projet est configuré pour Render.com. Le fichier `puppeteer.config.cjs` stocke Chrome dans le projet pour que le PDF fonctionne en production.

- **Root Directory** : `server` (si service backend séparé)
- **Build Command** : `npm install && npm run build`
- **Start Command** : `npm run start`

## Objectif du projet

CVForge AI est un projet portfolio conçu pour démontrer :

- L'intégration d'une API d'intelligence artificielle
- La conception d'une application web moderne
- La structuration d'un projet full-stack en monorepo
- La génération de PDF côté serveur avec Puppeteer
- La gestion de formulaires complexes (accordéons, modales de confirmation)
- La normalisation et déduplication de données

## Licence

Projet personnel — tous droits réservés.
