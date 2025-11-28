---
title: Documentation — Cactus Maroc
tags: [cactus, maroc, web, html, css, js, auth]
created: {{date}}
updated: {{date}}
---

# Cactus Maroc — Documentation du projet

> Objectif: Promouvoir et réhabiliter la culture du cactus au Maroc, éduquer sur ses impacts écologiques/économiques, vendre des produits et connecter acheteurs/fournisseurs.

## Aperçu
- Type: Site statique (HTML, CSS, JS)
- Public cible: Grand public, coopératives, intermédiaires, acheteurs/suppliers
- Pages clés:
  - `index.html` (Accueil): Hero, statistiques, galerie, CTA
  - `about.html` (À propos): Contexte, bénéfices, jalons
  - `shop.html` (Boutique): Catalogue + filtre; panier localStorage; accès après authentification
  - `intermediaire.html` (Intermédiaire): Formulaire acheteur/fournisseur + tableau persistant
  - `projets.html` (Projets): Liste + barres de progression; carte (placeholder)
  - `contact.html` (Contact): Formulaire validé + réseaux sociaux

## Pile technique
- HTML5 sémantique
- CSS (variables, Grid/Flex, palettes naturelles vert/beige/brun, responsive breakpoints)
- JavaScript vanilla modulaire
- Animations: ScrollReveal (gracieux si non chargé)
- Stockage: `localStorage` (panier, formulaires)
- Authentification: Auth0 SPA (OAuth2/OIDC) — optionnelle pour restreindre la boutique

## Structure du code
- `assets/css/styles.css`: Thème, nav, hero, sections, grilles, formulaires, responsive
- `assets/js/main.js`: Nav mobile, blur header, scroll-up, active link, reveal, compteurs stats, filtres boutique, panier, formulaires
- `assets/js/scrollreveal.min.js`: Librairie d’animation
- `assets/js/auth.js`: Intégration Auth0 (init, login/logout, gating boutique)
- `assets/img/*`: Images (héro, produits, etc.)

## Démarrage
1) Servir localement (requis pour OAuth):
   - Node: `npx serve` ou `npx http-server` dans le dossier du projet
   - Python: `python -m http.server 5500`
2) Ouvrir `http://localhost:PORT/index.html`
3) (Optionnel) Configurer Auth0 pour la boutique (voir ci-dessous)

## Authentification (Auth0)
- Fichier: `assets/js/auth.js`
- Remplacer les placeholders:
  - `domain: 'YOUR_AUTH0_DOMAIN'`
  - `clientId: 'YOUR_AUTH0_CLIENT_ID'`
- Dans le dashboard Auth0 > Application > Settings:
  - Allowed Callback URLs: `http://localhost:PORT`
  - Allowed Logout URLs: `http://localhost:PORT`
  - Allowed Web Origins: `http://localhost:PORT`
- Comportement:
  - Le bouton “Se connecter” redirige vers Auth0; après retour, le site débloque la boutique.

## Données & Persistance
- Panier (`shop.html`): `localStorage.cartItems` (id, title, price, qty)
- Intermédiaire (`intermediaire.html`): `localStorage.intermediaires` (name, email, role, product, message)
- Contact: `localStorage.contacts` (name, email, message)

## Responsive & Design
- Breakpoints:
  - ≤ 575px: mobile; colonnes uniques, nav overlay
  - 576–767px: grand mobile
  - 768–991px: tablette; hero 2 colonnes
  - ≥ 992px: desktop; nav inline
  - ≥ 1150px: grilles denses
- Typo: Montserrat; boutons arrondis, ombres douces
- Palette: verts cactus, neutres chauds, thème sombre élégant

## Animations & UX
- ScrollReveal: gradual reveal des sections/images
- Compteurs: statistiques animées à l’apparition
- Nav: blur au scroll, lien actif, scroll-up

## Fonctionnalités clefs
- Filtre par catégorie (boutique)
- Panier: ajouter/retirer/incrémenter, total, vider (persistant)
- Formulaires: validation JS de base, persistance locale, tableau dynamique
- Carte Projets: placeholder simple (intégration leaflet/Google Maps possible ultérieurement)

## Tâches / TODO
- [ ] Remplacer images par photos réelles des projets/produits
- [ ] Ajouter feuille de route et KPIs (tableau de bord)
- [ ] Intégrer une carte (Leaflet, sans clé, ou Google Maps)
- [ ] Export CSV des entrées Intermédiaire
- [ ] I18n (FR/AR/Tamazight)
- [ ] Audit performance (images optimisées, preloading, minification)
- [ ] Tests e2e (Playwright) pour formulaires/panier

## Déploiement
- Hébergement statique recommandé (Netlify, Vercel, GitHub Pages)
- Si Auth0 utilisé: ajouter le domaine de production dans les Allowed URLs

## Notes Obsidian
- Cette note peut servir de page d’accueil du projet. Créez d’autres notes:
  - [[Spécifications boutique]]
  - [[Roadmap cactus]]
  - [[Contenu marketing]]
- Utilisez des callouts pour les points clés:
  > [!info] Accès boutique
  > L’authentification Auth0 est nécessaire pour afficher les produits et le panier.

## Références rapides
- Accueil: `index.html`
- CSS: `assets/css/styles.css`
- JS global: `assets/js/main.js`
- Auth: `assets/js/auth.js`

