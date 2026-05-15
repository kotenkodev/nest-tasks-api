# NestJS Tasks API

A robust, production-ready Task Management API built with **NestJS**, **TypeORM**, and **PostgreSQL**. This project features secure authentication, Role-Based Access Control (RBAC), and comprehensive ownership enforcement.

## 🚀 Features

- **Authentication & Security**: JWT-based authentication with a global `AuthGuard`.
- **RBAC (Role-Based Access Control)**: Granular access control using `@Roles()` decorator and `RolesGuard`.
- **Task Management**: Full CRUD operations for tasks with label support.
- **Ownership Enforcement**: Users can only manage tasks they created.
- **Advanced Filtering**: Search tasks by title, description, status, and labels.
- **Validation & Transformation**: Strict data validation using `class-validator` and `class-transformer`.
- **Database Migrations**: Managed database schema evolution with TypeORM.
- **Testing**: Comprehensive E2E testing suite covering authentication, RBAC, and business logic.

## 🛠️ Tech Stack

- **Framework**: [NestJS](https://nestjs.com/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [TypeORM](https://typeorm.io/)
- **Validation**: [Class Validator](https://github.com/typestack/class-validator)
- **Containerization**: [Docker Compose](https://docs.docker.com/compose/)

## 📋 Prerequisites

- Node.js (v18+)
- Docker & Docker Compose
- npm

## ⚙️ Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/nest-tasks-api.git
   cd nest-tasks-api
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure environment variables:
   Create a `.env` file in the root directory and add:

   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=password
   DB_NAME=tasks
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=1h
   ```

4. Start the database:
   ```bash
   docker-compose up -d
   ```

## 🏃 Running the App

```bash
# Development mode
npm run start:dev

# Build the project
npm run build

# Production mode
npm run start:prod
```

## 🗄️ Database Migrations

```bash
# Generate a new migration based on entity changes
npm run migration:generate src/migrations/YourMigrationName

# Run pending migrations
npm run migration:run
```

## 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests
npm run test:e2e
```
