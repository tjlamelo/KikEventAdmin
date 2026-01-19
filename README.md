 
# 🚀 KikEvent Admin - Documentation Frontend (Angular 20)

Bienvenue dans le centre de commande de KikEvent ! Ce projet est le tableau de bord d'administration puissant et évolutif, conçu pour interagir fluidement avec notre API Spring Boot. Son architecture modulaire est le gage d'une performance optimale et d'une maintenance simplifiée.

---

## 🛠️ Prérequis Techniques : Préparez votre environnement

Pour faire décoller le projet sans heurt, assurez-vous que votre poste de développement est équipé des dernières versions :

*   **Node.js** : `v20.x` ou plus récent
*   **Angular CLI** : `^20.3.2`
*   **NPM** : `v10.x` ou plus récent

---

## 🏗️ Architecture du Projet : Les Piliers de notre Application

La force de notre application repose sur une architecture claire et pensée pour la collaboration, articulée autour de trois piliers fondamentaux : **Core**, **Shared**, et **Views**.

### 1. 📂 Core : Le Cœur Battant du Système

Ce dossier renferme l'ADN de l'application : tout ce qui est global, unique et essentiel à son fonctionnement.

*   **Models (`/models`)** :
    *   Le miroir parfait de votre backend. Les interfaces TypeScript y sont le reflet exact des entités et DTO de l'API Spring Boot.
    *   Les `Enums` sont vos meilleurs alliés pour gérer les rôles et permissions, bannissant les chaînes de caractères "en dur".
    *   *Exemple : `User.model.ts` est le jumeau de l'entité `User` du backend.*

*   **Services Généraux** :
    *   **AuthService** : Le gardien de l'authentification. Il gère les appels API (`login/register`) et maintient l'état de connexion de l'utilisateur.
    *   **AppInterceptor** : Votre assistant personnel HTTP. Prêt à l'emploi, il intercepte chaque requête pour :
        *   Ajouter automatiquement le Token JWT dans les en-têtes.
        *   Gérer de manière centralisée les erreurs (401, 403, 500).

### 2. 📂 Shared : La Boîte à Outils Commune

Ici trouvent refuge tous les composants et services réutilisables à travers l'application. Pensez-y comme à votre boîte de Lego pour construire plus vite et mieux.

*   **Components** : Le Loader, le Toast, la Sidebar, etc. *Note : Ces composants sont une base solide. N'hésitez pas à les personnaliser selon vos besoins !*
*   **Guards** : Les sentinelles de vos routes.
    *   `isAuthGuard` : Protège les routes privées des visiteurs non authentifiés.
    *   `RoleGuard` / `PermissionGuard` : Contrôle fin de l'accès en fonction des droits de l'utilisateur.
*   **Helpers** : Vos assistants du quotidien.
    *   `localStorage.ts` : Un service sécurisé (avec encryption `btoa`) pour stocker vos données sensibles en toute tranquillité.
    *   `user.ts` : La classe utilitaire pour avoir les infos de l'utilisateur connecté en un clin d'œil (`getUserId`, `isConnect`, etc.).
    *   `helper.ts` : Un fourre-tout pratique (conversion `FormData`, formatage de texte, calcul d'âge, etc.).

### 3. 📂 Views : L'Interface et la Logique Métier

C'est ici que la magie opère et que les pages prennent vie.

> ⭐ **Règle d'Or : L'Isolation des Services**
>
> Pour garantir un code propre et maintenable, chaque composant de page (ex: `login`, `dashboard`) qui interagit avec l'API doit posséder son propre dossier `services/`. Cette approche empêche de surcharger le dossier `Core` avec des services spécifiques à une seule fonctionnalité.

---

## 🌐 Intégration API : La Connexion avec Spring Boot

L'URL de base de l'API est configurée dans `src/environments/environment.ts` :

``` 
apiUrl: 'http://localhost:8080/api/v1'
```

**Workflow de création d'une fonctionnalité :**

1.  **Définir le Model** dans `core/models` (ex: `Event.model.ts`).
2.  **Créer le Service** dans le dossier de votre vue (ex: `views/events/services/event.service.ts`).
3.  **Utiliser le Helper** `Helpers.toFormData(data)` pour envoyer des fichiers (images) vers Spring Boot.

---

## 🤝 Collaboration et Workflow Git : Travaillons en Synergie

Pour maintenir un code impeccable et une collaboration fluide, nous adoptons le **Feature Branch Workflow**.

1.  **Synchronisez-vous** : `git checkout main` puis `git pull`.
2.  **Créez votre espace** : `git checkout -b feature/nom-de-votre-tâche`.

**Commandes essentielles :**

*   `ng serve` : Lancer le serveur de développement local.
*   `ng build` : Compiler le projet pour la production.

> ⚠️ **Important :** Une fois votre travail terminé, poussez votre branche et créez une **Pull Request (PR)**. Aucune modification ne doit être apportée directement sur la branche `main`.

---

## 📄 Focus sur nos Helpers : Les Secrets d'une Productivité Accrue

Ces petits utilitaires sont déjà prêts à l'emploi pour vous simplifier la vie.

### LocalStorage (`shared/helpers/localStorage.ts`)
Votre coffre-fort pour les données locales. Oubliez le `localStorage` natif et profitez de l'encryption automatique.

``` 
// Stocke une valeur de manière sécurisée
LocalStorage.setItem('ma_cle', 'ma_valeur');

// Récupère la valeur en clair
const data = LocalStorage.getItem('ma_cle');
```

### UserHelper (`shared/helpers/user.ts`)
La carte d'identité de votre utilisateur, toujours à portée de main.

```typescript
if (UserHelper.isConnect()) {
  const userId = UserHelper.getUserId();
  // Faites quelque chose avec l'ID...
}
```

---

Bon code et bienvenue dans l'aventure KikEvent ! 🚀