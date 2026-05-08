# Rapport — TaskFlow API

Module : NestJS — ESGI 5ESGI-IW

---

## 1. Choix techniques

### Architecture modulaire NestJS

Chaque domaine métier (users, teams, projects, tasks, comments) est isolé dans son propre module NestJS. Cette séparation respecte le principe de responsabilité unique : chaque module n'expose son service via `exports` que lorsqu'un autre module en a explicitement besoin (ex. `UsersModule` exporté vers `AuthModule` et `TeamsModule`). Cela limite le couplage entre les modules et facilite la maintenabilité.

Le module racine `AppModule` orchestre l'ensemble : configuration globale via `ConfigModule.forRoot()`, connexion TypeORM asynchrone via `ConfigService`, et application des guards globaux (`JwtAuthGuard`, `RolesGuard`) via le token d'injection `APP_GUARD`.

### Relations entre entités (TypeORM)

Le schéma de base de données est entièrement piloté par les entités TypeORM. Les relations ont été choisies pour refléter fidèlement le domaine :

- `User ↔ Team` : **ManyToMany** via la table de jointure `team_members` — un utilisateur peut appartenir à plusieurs équipes, une équipe a plusieurs membres.
- `Team → Project` : **OneToMany** — un projet appartient à une seule équipe (`onDelete: CASCADE` : supprimer une équipe supprime ses projets).
- `Project → Task` : **OneToMany** avec `onDelete: CASCADE` — supprimer un projet supprime automatiquement toutes ses tâches.
- `Task → Comment` : **OneToMany** avec `onDelete: CASCADE` — les commentaires suivent le cycle de vie de la tâche.
- `Task → User` (assignee) : **ManyToOne nullable** avec `onDelete: SET NULL` — si un utilisateur est supprimé, la tâche est conservée mais désassignée.
- `Comment → User` (author) : **ManyToOne** avec `onDelete: CASCADE` — supprimer un utilisateur supprime ses commentaires.

`synchronize: false` a été choisi en faveur des migrations explicites afin de garder un contrôle total du schéma, éviter toute perte de données accidentelle en production, et conserver un historique des changements de schéma versionné.

### Stratégie d'authentification

Deux stratégies Passport sont combinées pour couvrir les deux flux d'authentification :

- **LocalStrategy** (`POST /auth/login`) : reçoit email et mot de passe en clair, valide le hash bcrypt stocké en base (`select: false` sur le champ `passwordHash` pour ne jamais l'exposer par défaut), puis émet un JWT signé.
- **JwtStrategy** (toutes les autres routes) : extrait le token depuis le header `Authorization: Bearer`, vérifie la signature et l'expiration, et hydrate `req.user` avec `{ id, email, role }`.

Le `JwtAuthGuard` est enregistré comme guard **global** via `APP_GUARD`. L'avantage de cette approche est d'inverser la logique de sécurité : toutes les routes sont protégées par défaut, et le décorateur `@Public()` marque explicitement les rares routes ouvertes (`/auth/login`, `/health`). Cela élimine le risque d'oublier de protéger un endpoint.

### Autorisation RBAC (Role-Based Access Control)

Le `RolesGuard` est appliqué en second guard global, après `JwtAuthGuard`. Il lit les métadonnées attachées par le décorateur `@Roles(UserRole.ADMIN)` via `Reflector` et compare avec le rôle de l'utilisateur issu du JWT.

Trois rôles sont définis : `admin`, `member`, `viewer`. Les règles appliquées :
- Créer/modifier/supprimer des projets : `ADMIN` ou `MEMBER`
- Créer des utilisateurs : `ADMIN` uniquement
- Supprimer des utilisateurs : `ADMIN` uniquement
- Modifier un commentaire : auteur du commentaire ou `ADMIN`

Les vérifications d'ownership (modifier son propre profil, supprimer son propre commentaire) sont traitées au niveau du **service** plutôt que du guard, pour éviter de surcharger la logique d'autorisation transversale avec des règles métier spécifiques.

### WebSockets — Notifications temps réel

Le gateway Socket.IO (`/notifications`) permet d'envoyer des événements en temps réel aux clients connectés. L'authentification est assurée par le JWT passé dans `handshake.auth.token` à la connexion. À chaque assignation de tâche (`PATCH /tasks/:id` avec un nouvel `assigneeId`), le `TasksService` émet un événement `task:assigned` directement à la room de l'utilisateur concerné, sans que le client ait à poller l'API.

### Organisation des tests

- **Tests unitaires** : les services sont testés avec des repositories mockés (`mock-repository.helper.ts`), ce qui permet de valider la logique métier (ConflictException, NotFoundException, hash bcrypt) de façon rapide et isolée, sans dépendance à une base de données.
- **Tests E2E** : une vraie base PostgreSQL de test est utilisée (`.env.test`). Les suites tournent en séquentiel (`--runInBand`) pour éviter les conflits sur la base partagée. La base est nettoyée avant chaque suite via `TRUNCATE … CASCADE` pour garantir l'idempotence des tests.

### CI/CD et Docker

Un Dockerfile multi-stage sépare la phase de compilation (image complète avec devDependencies) de l'image de production (Alpine légère, dependencies only, utilisateur non-root). Le pipeline GitHub Actions lance les tests unitaires et E2E sur chaque push/PR, avec un service PostgreSQL éphémère, puis build l'image Docker uniquement sur `main`.

---

## 2. Difficultés rencontrées

**Migrations TypeORM** : La première migration générée était un diff partiel (renommage de colonne `team_id → teamId`) produit à partir d'un environnement où les tables existaient déjà. Sur une base vide, elle échouait immédiatement avec `relation "projects" does not exist`. La solution a été de supprimer cette migration corrompue et d'en générer une nouvelle depuis l'état actuel des entités, produisant une migration initiale complète qui crée toutes les tables en partant de zéro.

**Guards globaux et routes publiques** : Enregistrer `JwtAuthGuard` via `APP_GUARD` implique qu'il s'applique également aux tests E2E si l'application est recréée sans précaution. La solution est d'utiliser `@Public()` sur les endpoints ouverts et de s'assurer que les helpers de test recréent l'application avec l'ensemble des modules (y compris `AuthModule`) pour que les guards aient accès au `JwtService`.

**WebSocket et authentification** : Passport ne prend pas en charge les connexions WebSocket nativement — le guard HTTP ne s'exécute pas lors du handshake Socket.IO. La vérification du JWT a donc dû être faite manuellement dans `handleConnection()` en extrayant le token depuis `client.handshake.auth.token` et en le vérifiant via `JwtService.verify()`.

**Migration vers Prisma (bonus S16)** : L'implémentation de la branche Prisma a été bloquée par des incompatibilités de versions entre `prisma` (v6), `@prisma/client` et NestJS 11. Les types générés par Prisma CLI supposaient des APIs de `@prisma/client/runtime` qui n'étaient plus exposées publiquement dans les versions récentes, causant des erreurs TypeScript à la compilation (`Module '"@prisma/client/runtime/library"' has no exported member`). Des tentatives de fixation via `prisma generate --no-engine` et la configuration de `output` dans `schema.prisma` n'ont pas suffi à résoudre l'incompatibilité. La fonctionnalité reste donc sur une branche dédiée dans un état partiel.

---

## 3. Améliorations avec plus de temps

- **Pagination** : les endpoints `findAll` retournent l'intégralité des ressources sans limite. Ajouter des paramètres `?page` et `?limit` avec `take/skip` TypeORM serait la première priorité pour la performance en production.
- **Rate limiting** : intégrer `@nestjs/throttler` sur les endpoints d'authentification (`/auth/login`) pour se protéger des attaques par force brute.
- **Refresh tokens** : le JWT actuel expire en 24h sans mécanisme de renouvellement transparent. Un système de refresh token stocké en base (ou Redis) permettrait des sessions longues sans redemander les identifiants.
- **Filtres et recherche** : ajouter des query params sur les listes (`?projectId=`, `?status=`, `?assigneeId=`) pour filtrer les tâches côté serveur plutôt que côté client.
- **Soft delete** : utiliser `@DeleteDateColumn` de TypeORM pour conserver l'historique des suppressions au lieu de les effacer physiquement, utile pour l'audit et la restauration.
- **Tests de couverture** : étendre les tests unitaires aux controllers et aux services restants (projects, teams, tasks, comments) pour dépasser les 80% de couverture.
