# CVForge AI

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-API-412991?logo=openai&logoColor=white)

CVForge AI est une application web moderne qui permet de **générer automatiquement un CV professionnel** grâce à l'intelligence artificielle.

L'objectif est de simplifier la création de CV en transformant quelques informations simples (expérience, compétences, formation) en un CV structuré, optimisé et prêt à être envoyé aux recruteurs.

## Fonctionnalités

- **Génération automatique de CV** : créez un CV complet en quelques secondes à partir de vos informations.
- **Prévisualisation en temps réel** : visualisez votre CV au fur et à mesure de la saisie.
- **Amélioration intelligente** : reformulation des expériences professionnelles pour les rendre plus percutantes.
- **Adaptation à une offre d'emploi** : optimisez votre CV pour une offre spécifique et les systèmes ATS.
- **Export PDF** : téléchargez votre CV dans un format propre et professionnel.

## Technologies

| Catégorie | Technologies |
|-----------|-------------|
| Frontend | React, TypeScript, Vite |
| Backend | Node.js, Express |
| IA | API OpenAI |

## Structure du projet

```
src/
├── components/
│   └── icons/          # Composants SVG (icônes)
├── pages/
│   └── home/           # Page d'accueil (Home.tsx, Home.css)
├── assets/             # Ressources statiques
├── App.tsx             # Composant racine
├── App.css
├── main.tsx            # Point d'entrée
└── index.css           # Styles globaux
```

## Installation

```bash
# Cloner le projet
git clone https://github.com/votre-username/cvforge-ai.git
cd cvforge-ai

# Installer les dépendances
npm install

# Lancer le serveur de développement
npm run dev
```

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `npm run dev` | Lance le serveur de développement Vite |
| `npm run build` | Compile TypeScript et génère le build de production |
| `npm run preview` | Prévisualise le build de production |
| `npm run lint` | Vérifie le code avec ESLint |

## Objectif du projet

CVForge AI est un projet portfolio conçu pour démontrer :

- L'intégration d'une API d'intelligence artificielle
- La conception d'une application web moderne
- La structuration d'un projet full-stack

## Licence

Projet personnel — tous droits réservés.
