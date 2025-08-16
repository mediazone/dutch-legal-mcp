# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Build and Development
```bash
npm run build          # Compile TypeScript to dist/
npm run dev            # Watch mode compilation
npm run start          # Run the compiled MCP server
```

### Testing and Validation
```bash
npm test               # Run Jest tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Generate coverage report
npm run test:ci        # CI-optimized test run
npm run validate       # Full validation pipeline (type-check + lint + test)
```

### Code Quality
```bash
npm run lint           # ESLint checking
npm run lint:fix       # Auto-fix linting issues
npm run type-check     # TypeScript type checking only
npm run audit          # Security audit (high-severity only)
npm run security-check # Combined audit and outdated packages
```

### Publishing and Compliance
```bash
npm run meta-compliance    # Self-compliance GDPR check
npm run prepare           # Pre-publish build
npm run prepublishOnly    # Full validation before publish
```

## Architecture Overview

### Clean Architecture Pattern
The codebase follows **Clean Architecture** with strict separation of concerns:

- **`src/main.ts`**: Entry point with MCP server setup and dependency injection
- **`src/application/`**: Application layer (use cases and tool registry)
- **`src/domain/`**: Domain layer (entities and service interfaces)
- **`src/infrastructure/`**: Infrastructure layer (API clients and concrete services)
- **`src/shared/`**: Cross-cutting concerns (DI container, validators, formatters, errors)

### Dependency Injection System
Uses custom DI container (`src/shared/container.ts`) with symbol-based tokens:
- Services registered at startup in `main.ts:setupDependencies()`
- Singleton pattern by default
- Type-safe service resolution with `TOKENS` constants

### MCP Tool Architecture
Implements **Strategy Pattern** for tools in `src/application/tool-registry.ts`:
- Each tool is a strategy class implementing `ToolStrategy` interface
- Tools: `search_dutch_case_law`, `check_gdpr_compliance`, `classify_ai_system`, `analyze_legal_risk`, `get_dpa_updates`
- Input validation with Zod schemas in `src/shared/validators.ts`
- Consistent output formatting in `src/shared/formatters.ts`

### Service Layer Design
**Infrastructure services** (`src/infrastructure/services.ts`) implement domain interfaces:
- `RechtspraakCaseLawService`: Court case search with XML parsing
- `GDPRComplianceServiceImpl`: GDPR compliance scoring and violation detection
- `RiskAnalysisServiceImpl`: Multi-domain legal risk assessment
- `DPAServiceImpl`: Dutch Data Protection Authority updates

### Error Handling Strategy
Comprehensive error handling with `@withErrorHandling` decorator:
- Graceful error recovery in use cases
- Consistent error formatting across tools
- Safe validation with functional error handling

## Key Implementation Details

### API Integration
- **Rechtspraak.nl**: Two-step process (search for ECLIs, then fetch content)
- **XML Parsing**: Custom parsers for Dutch court data formats
- **Rate Limiting**: Respects API limits with retry logic in `ApiClientFactory`
- **Caching**: 5-minute TTL with ETag support

### Data Processing
- **Court Cases**: ECLI extraction, precedent value calculation, metadata parsing
- **GDPR Assessment**: Risk scoring based on data types, sensitivity analysis
- **AI Act Classification**: 4-tier risk categorization (minimal/limited/high/unacceptable)
- **Risk Analysis**: Combined GDPR/AI Act assessment with contractual risk evaluation

### TypeScript Configuration
- **ES2022/ESNext**: Modern JavaScript features
- **Strict mode**: Full type safety enforcement
- **Source maps**: Debug support
- **Declaration files**: Type definitions for consumers

## Development Workflow

1. **Make changes**: Edit source files in `src/`
2. **Validate**: Run `npm run validate` before committing
3. **Test**: Use `npm run test:watch` during development
4. **Build**: `npm run build` compiles to `dist/`
5. **Local testing**: `npm run start` for manual MCP server testing

## Important Constants

### Risk Assessment Thresholds
Defined in `src/shared/constants.ts`:
- GDPR risk scoring based on data sensitivity
- AI Act risk domains for classification
- Compliance violation severity levels

### Service Registration
DI tokens in `src/shared/container.ts`:
- `TOKENS.CASE_LAW_SERVICE`
- `TOKENS.COMPLIANCE_SERVICE`
- `TOKENS.RISK_ANALYSIS_SERVICE`
- `TOKENS.DPA_SERVICE`