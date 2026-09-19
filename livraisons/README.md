# livraisons — là où arrivent les écrans

Ce dossier est la **sortie** du travail de design. C'est ce que le développement récupère ensuite.

## Nom des fichiers

| Étape | Fichier attendu |
|---|---|
| 1 | `etape-1-systeme-de-design.html` |
| 2 | `etape-2-charte.html` |
| 3 | `etape-3-entete-navigation.html` |
| 4 | `etape-4-accueil.html` |
| 5 | `etape-5-catalogue.html` |
| 6 | `etape-6-fiche-produit.html` |
| 7 | `etape-7-panier-tunnel.html` |
| 8 | `etape-8-comptes.html` |
| 9 | `etape-9-contenus-pages.html` |
| 10 | `etape-10-prototype-cliquable.html` |

## Ce qu'un fichier livré doit être

- **Autonome** : CSS et JS dans le fichier, **aucune ressource externe**, aucune bibliothèque ajoutée.
- **Le système appliqué** : uniquement les couleurs, les polices et les espacements décrits dans
  `CLAUDE.md`.
- **Annoté** : chaque zone paramétrable porte le **nom exact du champ** attendu en back-office.
- **Responsive** : montré au moins en 390 px et en 1280 px.

## Comment le fichier arrive ici

### A. Sans rien configurer — le dépôt par le navigateur (30 secondes)

Dans GitHub, ouvrir ce dossier → *Add file* → *Upload files* → glisser le fichier → valider. Pour
`SUIVI.md` : l'ouvrir, cliquer sur le crayon, remplir la ligne, valider. Aucune ligne de commande, aucun
droit à accorder, aucun risque.

### B. Avec l'accès en écriture (l'outil de design dépose lui-même)

Pour que Claude écrive dans le dépôt, il faut **deux autorisations**, dans cet ordre :

1. **Côté GitHub** — l'application GitHub de Claude doit voir ce dépôt.
   `github.com` → *Settings* (ton compte) → *Applications* → *Installed GitHub Apps* → **Claude** →
   *Configure* → **Repository access** → cocher `the-replicant-theme`.
   (Le dépôt appartient à un compte personnel ; pour une organisation, c'est
   *Settings → Third-party Access → GitHub Apps*.)
2. **Côté Claude** — *Settings* → *Connectors* → **GitHub** → *Connect*, puis autoriser.
   Claude demande alors **lecture _et_ écriture** sur les dépôts choisis : c'est normal et c'est ce qu'il
   faut pour déposer un fichier. En revanche **un envoi de commit reste soumis à ta confirmation
   explicite** — Claude te demande l'accord avant de pousser.

**Trois règles quand l'outil a l'accès en écriture :**

- **Travailler sur une branche**, jamais directement sur `main` : demande `claude/etape-N`. On relit, puis
  on fusionne. Rien n'arrive dans la version de référence sans relecture.
- **Ne toucher que `livraisons/`.** `outillage/`, `memoire.md` et `docs/preuves/` concernent l'exploitation
  du serveur — ce n'est pas le travail de design.
- **Cocher `SUIVI.md` dans le même mouvement** que le dépôt du fichier : sans ça, on ne sait plus où on en
  est.

> ⚠️ L'accès en écriture porte sur **tout le dépôt**, pas seulement sur ce dossier : les trois règles
> ci-dessus sont donc la seule protection. Si tu veux une séparation réelle, crée un dépôt dédié au design
> (`the-replicant-design`) et donne l'accès en écriture **à lui seul** : l'outil ne pourra alors
> physiquement pas toucher à l'exploitation.
