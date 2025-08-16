# Changelog

All notable changes to the Dutch Legal MCP Server will be documented in this file.

## [2.0.12] - 2025-08-16

### 🔧 Changed
- Made court data endpoints user-configurable for legal compliance
- Added disclaimers about user responsibility for API usage
- Marked DPA service as placeholder/roadmap feature with clear mock data indicators

### 🔒 Security
- Implemented rate limiting with exponential backoff
- Added user responsibility disclaimers for API endpoint usage
- Enhanced error handling and timeout management

## [2.0.6] - 2025-08-15

### ✨ Added
- Dutch Case Law Search: Access to 800,000+ court decisions from Rechtspraak.nl
- GDPR Compliance Checker: Automated privacy law guidance with risk scoring
- EU AI Act Classification: AI system risk assessment and compliance requirements
- Legal Risk Analysis: Multi-domain legal risk evaluation
- TypeScript support with strict mode enabled
- NPM package distribution
- Claude Code MCP integration

### 🔧 Technical Features
- Two-step search process for court decisions
- XML parsing for Rechtspraak.nl data
- Comprehensive error handling and validation
- Real-time API integration with timeout handling
- Clean architecture with dependency injection

## [1.0.0] - 2025-08-09

### ✨ Initial Release
- Core MCP server implementation
- Basic Dutch legal data access
- MIT license for open source use