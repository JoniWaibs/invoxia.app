# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- **Build**: `npm run build` - Compiles TypeScript to JavaScript in `dist/`
- **Development**: `npm run dev` - Starts server with hot reload using tsx
- **Production**: `npm start` - Runs the compiled server from `dist/server.js`
- **Testing**: 
  - `npm test` - Run all tests
  - `npm run test:watch` - Run tests in watch mode
  - `npm run test:coverage` - Run tests with coverage report
- **Code Quality**:
  - `npm run lint` - Lint TypeScript files
  - `npm run lint:fix` - Auto-fix linting issues
  - `npm run format` - Format code with Prettier
  - `npm run format:check` - Check code formatting

## Project Architecture

This is a **multi-tenant electronic invoicing system** for AFIP (Argentina's tax authority) built with:

- **Framework**: Fastify with TypeScript (ES modules)
- **Database**: PostgreSQL with Prisma ORM
- **Queue System**: BullMQ with Redis
- **PDF Generation**: Puppeteer
- **Messaging**: WhatsApp Business Cloud API + SMTP
- **AFIP Integration**: @afipsdk/afip.js for WSAA + WSFEv1

### Core Features
- Multi-tenant architecture with complete data isolation
- Batch invoice processing (1-40 invoices at once)
- AFIP integration (WSAA authentication + WSFEv1 electronic invoicing)
- Automatic PDF generation with mandatory AFIP QR codes
- WhatsApp and Email delivery automation
- WhatsApp interface for batch management

### Application Structure
- `src/app.ts` - Fastify application factory with route configuration
- `src/server.ts` - Server startup and configuration
- Entry point builds to `dist/server.js`
- Tests in `tests/` directory using Jest with supertest for API testing

### Invoice Processing Flow
1. **Preview Phase**: CSV/XLSX upload → validate → create draft invoices
2. **Confirmation**: User confirms batch → queue processing jobs
3. **Processing**: AFIP authorization → PDF generation → automatic delivery
4. **Completion**: Status tracking and PDF download availability

## Technical Configuration

- **Node.js**: Requires v23.0.0+
- **TypeScript**: Strict mode enabled with ES2022 target
- **Module System**: ES modules (type: "module")
- **Test Framework**: Jest with ts-jest preset for ES modules
- **Code Style**: Prettier + ESLint with TypeScript rules
- **Port**: Defaults to 3000 (configurable via PORT env var)