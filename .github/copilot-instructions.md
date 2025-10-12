# Copilot Instructions for Ficha Médica Portátil FAMED UCN

## Project Overview
This project integrates hardware and software to enable oncology patients to carry their medical history on a QR/NFC card or bracelet. Health professionals can access critical information instantly and securely. The system includes web and mobile apps, a NestJS backend, and Google Cloud infrastructure.

## Architecture & Key Components
- **Backend (`backend/`)**: NestJS (TypeScript), organized by modules (e.g., `auth/`). Uses TypeORM for PostgreSQL (Cloud SQL) integration. Main entry: `src/main.ts`, root module: `src/app.module.ts`.
- **Entities**: Domain models (e.g., `user.entity.ts`) follow TypeORM conventions. Services and controllers are split by feature (see `auth/`).
- **Frontend Web**: React + Vite (not present in this repo).
- **Frontend Mobile**: React Native + Expo Go (not present in this repo).
- **File Storage**: Google Cloud Storage for medical documents/images.

## Developer Workflows
- **Backend Development**:
  - Start server: `npm run start:dev` (from `backend/`)
  - Run tests: `npm run test` (Jest, from `backend/`)
  - Lint: `npm run lint`
  - Build: `npm run build`
- **Database**: Configure PostgreSQL connection in environment files. Use TypeORM migrations for schema changes.
- **Authentication**: JWT-based, with support for MFA. See `auth/` module for implementation.
- **Roles**: Patient and Medical Staff, enforced via guards and decorators in controllers/services.

## Project-Specific Patterns
- **Module Structure**: Each feature (e.g., `auth`) has its own controller, service, and entities folder.
- **Entity Design**: Use TypeORM decorators for models. Example: `@Entity()`, `@PrimaryGeneratedColumn()`, `@Column()` in `user.entity.ts`.
- **Testing**: Use Jest. Test files are named `*.spec.ts` and colocated with their source files.
- **Security**: Always validate user input. Use guards for role-based access. Sensitive data (medical info) must be protected at all layers.
- **QR/NFC Integration**: Backend generates and validates codes; frontend handles scanning and display.

## Integration Points
- **Google Cloud**: Backend connects to Cloud SQL and Cloud Storage. Credentials managed via environment variables.
- **External Access**: API endpoints are designed for fast, secure access (<3 seconds) to critical data.

## Conventions & Examples
- **File Naming**: Use kebab-case for folders, camelCase for files and symbols.
- **Example Entity**:
  ```typescript
  @Entity()
  export class User {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name: string;
    // ...other fields
  }
  ```
- **Example Test**: `auth.controller.spec.ts` tests controller logic using Jest and NestJS testing utilities.

## References
- See `README.md` for project goals, architecture, and team info.
- Key backend files: `src/app.module.ts`, `src/main.ts`, `src/auth/`

---
For questions about unclear conventions or missing context, ask the team for clarification or request updates to this file.
