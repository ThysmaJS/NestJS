# Rapport — TaskFlow API

Module : NestJS — ESGI 5ESGI-IW

---

## 1. Choix techniques

### Architecture modulaire NestJS

Chaque domaine métier (users, teams, projects, tasks, comments) est isolé dans son propre module NestJS. Cette séparation respecte le principe de responsabilité unique : chaque module expose son service via `exports` uniquement lorsqu'un autre module en a besoin (ex. `UsersModule` exporté vers `AuthModule` et `TeamsModule`).

### Relations entre entités (TypeORM)

Les relations reflètent le domaine métier :

- `User ↔ Team` : ManyToMany via la table de jointure `team_members` — un utilisateur peut appartenir à plusieurs équipes et une équipe a plusieurs membres.
- `Team → Project` : OneToMany — un projet appartient à une seule équipe.
- `Project → Task` : OneToMany avec `onDelete: CASCADE` — supprimer un projet supprime ses tâches.
- `Task → Comment` : OneToMany avec `onDelete: CASCADE` — idem.
- `Task → User` (assignee) : ManyToOne nullable avec `onDelete: SET NULL` — si un utilisateur est supprimé, la tâche n'est pas perdue.

`synchronize: false` est utilisé en faveur des migrations explicites, pour garder le contrôle total du schéma en production.

### Stratégie d'authentification

Deux stratégies Passport sont combinées :

- **LocalStrategy** (`POST /auth/login`) : valide email/password via bcrypt, retourne un JWT signé.
- **JwtStrategy** (`Bearer token`) : extrait et vérifie le token à chaque requête, hydrate `req.user` avec `{ id, email, role }`.

Le `JwtAuthGuard` est appliqué **globalement** via `APP_GUARD`, ce qui inverse la logique : tous les endpoints sont protégés par défaut, et le décorateur `@Public()` marque explicitement les routes ouvertes. Cette approche évite les oublis de protection.

### Autorisation RBAC

Le `RolesGuard` est appliqué globalement en second guard. Le décorateur `@Roles(UserRole.ADMIN)` attache les rôles requis via les métadonnées Reflector. Les vérifications d'ownership (modifier son propre profil, supprimer son propre commentaire) sont traitées au niveau service pour ne pas polluer le guard.

### Organisation des tests

- **Tests unitaires** : les services sont testés avec des repositories mockés (`mock-repository.helper.ts`). L'objectif est de valider la logique métier (ConflictException, NotFoundException, hash bcrypt) sans dépendance à la base.
- **Tests E2E** : une vraie base PostgreSQL de test est utilisée (`.env.test`). Les suites s'exécutent en séquentiel (`--runInBand`) pour éviter les conflits. La base est nettoyée avant chaque suite via `TRUNCATE … CASCADE`.

---

## 2. Difficultés rencontrées

**Migrations TypeORM** : La première migration générée était un diff partiel (renommage de colonne) produit alors que les tables existaient dans un ancien environnement. Sur une base vide, elle échouait avec `relation "projects" does not exist`. La solution a été de supprimer cette migration et d'en générer une nouvelle depuis l'état actuel des entités, qui crée le schéma complet.

**Guards globaux et routes publiques** : Appliquer `JwtAuthGuard` globalement via `APP_GUARD` implique que le guard s'exécute avant même que le module soit pleinement initialisé dans certains cas de test. La solution est d'utiliser `@Public()` explicitement sur les endpoints de login et health, et de recréer l'application complète dans les helpers E2E.

**WebSocket et authentification** : Le gateway Socket.IO reçoit le JWT dans `handshake.auth.token`. La vérification manuelle du token dans `handleConnection` est nécessaire car Passport ne gère pas les connexions WebSocket nativement.

---

## 3. Améliorations avec plus de temps

- **Pagination** : les endpoints `findAll` retournent toutes les ressources sans limite. Ajouter `?page=1&limit=20` via `@nestjs/typeorm` `take/skip` serait la priorité pour la performance.
- **Rate limiting** : `@nestjs/throttler` sur les endpoints d'authentification pour protéger contre le brute-force.
- **Refresh tokens** : le JWT actuel expire en 24h sans mécanisme de renouvellement. Un système de refresh token (stocké en base ou Redis) serait nécessaire en production.
- **Tests de couverture** : couvrir les controllers et les services restants (projects, teams, tasks) avec des tests unitaires dédiés.
- **Soft delete** : utiliser `@DeleteDateColumn` de TypeORM pour conserver l'historique au lieu de suppressions physiques.
