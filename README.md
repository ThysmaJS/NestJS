# TaskFlow API

API RESTful de gestion de projets et tâches, construite avec NestJS, TypeORM et PostgreSQL.

## Stack technique

- **Runtime** : Node.js 20 / TypeScript
- **Framework** : NestJS 11
- **Base de données** : PostgreSQL 16 via TypeORM
- **Authentification** : JWT + Passport.js (stratégies local + jwt)
- **WebSockets** : Socket.IO (`@nestjs/websockets`)
- **Documentation** : Swagger / OpenAPI (`@nestjs/swagger`)
- **Sécurité** : Helmet, RBAC (admin / member / viewer)
- **Tests** : Jest (unitaires) + Supertest (e2e)
- **CI** : GitHub Actions
- **Docker** : multi-stage build + docker-compose (dev & prod)

---

## Architecture

```
src/
├── auth/           # JWT, LocalStrategy, JwtAuthGuard, RolesGuard, décorateurs
├── users/          # CRUD utilisateurs + ownership check
├── teams/          # Gestion des équipes
├── projects/       # Gestion des projets
├── tasks/          # Gestion des tâches + notification à l'assigné
├── comments/       # Commentaires sur les tâches
├── notifications/  # WebSocket gateway (Socket.IO)
├── health/         # Health check TypeORM (Terminus)
├── common/         # GlobalExceptionFilter, LoggingInterceptor, helpers
└── database/       # Migrations TypeORM, seeds
```

---

## Prérequis

- Node.js >= 20
- Docker + Docker Compose

---

## Démarrage en développement

### 1. Cloner et installer

```bash
git clone <repo>
cd taskflow-api
npm install
```

### 2. Lancer PostgreSQL

```bash
docker compose up -d
```

### 3. Configurer l'environnement

Le fichier `.env` est présent avec les valeurs par défaut :

```env
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=taskflow
DB_USER=taskflow
DB_PASSWORD=taskflow
JWT_SECRET=taskflow-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h
```

### 4. Lancer les migrations

```bash
npm run migration:run
```

### 5. Seeder la base

```bash
npm run seed
```

Crée 3 utilisateurs, 2 équipes, 2 projets, 3 tâches et 2 commentaires :

| Email | Mot de passe | Rôle |
|---|---|---|
| alice@example.com | password123 | admin |
| bob@example.com | password123 | member |
| charlie@example.com | password123 | viewer |

### 6. Démarrer le serveur

```bash
npm run start:dev
```

L'API écoute sur `http://localhost:3000`.

---

## Endpoints principaux

Tous les endpoints sont préfixés `/api`.

| Méthode | Route | Accès |
|---|---|---|
| POST | /api/auth/login | Public |
| GET | /api/auth/me | Authentifié |
| GET | /api/health | Public |
| GET | /api/users | Authentifié |
| POST | /api/users | Admin uniquement |
| GET/PATCH/DELETE | /api/users/:id | Authentifié (ownership ou admin) |
| GET/POST | /api/teams | Authentifié |
| GET/POST | /api/projects | Authentifié |
| GET/POST | /api/tasks | Authentifié |
| PATCH/DELETE | /api/tasks/:id | Authentifié |
| GET/POST | /api/comments | Authentifié |

---

## Documentation Swagger

Disponible en mode développement sur :

```
http://localhost:3000/docs
```

Pour tester les endpoints protégés :
1. `POST /api/auth/login` avec `{ "email": "alice@example.com", "password": "password123" }`
2. Copier le `access_token`
3. Cliquer **Authorize** (cadenas en haut à droite) et coller le token

---

## Tests

### Unitaires

```bash
npm run test
npm run test:cov   # avec rapport de couverture
```

Couvre `UsersService` (8 tests) et `RolesGuard` (5 tests) avec repositories mockés.

### E2E

Créer la base de test si elle n'existe pas encore :

```bash
docker exec -it taskflow_postgres psql -U taskflow -c "CREATE DATABASE taskflow_test;"
```

Lancer les tests e2e :

```bash
npm run test:e2e
```

Les tests utilisent `.env.test`, tournent en séquentiel (`--runInBand`) pour éviter les conflits sur la base partagée, et la base est nettoyée avant chaque suite via `TRUNCATE ... CASCADE`.

Suites couvertes :
- **Auth** : login valide, login invalide, GET /me avec token, GET /me sans token
- **Users** : liste, création, validation email, 401/403, cycle complet créer → récupérer → supprimer

---

## WebSockets — Notifications temps réel

Le gateway Socket.IO écoute sur le namespace `/notifications`. À la connexion, le client doit passer son JWT :

```js
const socket = io('http://localhost:3000/notifications', {
  auth: { token: '<jwt>' }
});
```

### Événements

| Événement | Direction | Description |
|---|---|---|
| `join:project` | client → serveur | Rejoindre la room d'un projet |
| `task:assigned` | serveur → client | Notifié quand une tâche lui est assignée |

### Tester en temps réel

1. Ouvrir `http://localhost:3000/test-ws.html` dans deux onglets
2. Onglet 1 : coller le token Alice (admin) → Se connecter
3. Onglet 2 : coller le token Bob (member) → Se connecter
4. Via Swagger ou curl, envoyer `PATCH /api/tasks/:id` avec `{ "assigneeId": "<bob_id>" }`
5. L'onglet Bob reçoit l'événement `task:assigned` en temps réel

---

## Déploiement Docker (production)

### Build et lancement

```bash
docker compose -f docker-compose.prod.yml --env-file .env.production up --build -d
```

### Fichier `.env.production` (ne pas committer)

```env
NODE_ENV=production
DB_HOST=postgres
DB_PORT=5432
DB_NAME=taskflow
DB_USER=taskflow_prod
DB_PASSWORD=<mot_de_passe_fort>
JWT_SECRET=<secret_aleatoire_min_64_chars>
JWT_EXPIRES_IN=8h
```

Le Dockerfile est multi-stage :
- **builder** : compile TypeScript avec toutes les dépendances
- **runner** : image légère (~241 MB), prod dependencies uniquement, utilisateur non-root

### Vérifier la santé

```bash
curl http://localhost:3000/api/health
# { "status": "ok", "info": { "database": { "status": "up" } } }
```

---

## CI GitHub Actions

Le pipeline se déclenche sur push vers `main`/`develop` et sur les PR vers `main`.

**Job Tests** (toutes les branches) :
- Démarre un PostgreSQL de test en service
- Installe les dépendances (`npm ci`)
- Lance les tests unitaires avec couverture
- Lance les tests e2e

**Job Build Docker** (push sur `main` uniquement) :
- Build l'image Docker multi-stage
- Affiche la taille de l'image

---

## Commandes utiles

```bash
npm run start:dev           # Démarrage avec hot-reload
npm run build               # Compilation TypeScript
npm run migration:generate  # Générer une migration depuis les entités
npm run migration:run       # Appliquer les migrations
npm run migration:revert    # Annuler la dernière migration
npm run seed                # Insérer les données de développement
npm run test                # Tests unitaires
npm run test:e2e            # Tests e2e
npm run test:cov            # Couverture de tests
```
