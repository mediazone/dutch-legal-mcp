# 🔐 Security Policy

## Repository Security

This repository is **PUBLIC** and contains **NO SENSITIVE INFORMATION**.

### ✅ What is Safe in This Repository
- Source code (all open source)
- Test files with mock data only
- Documentation and examples
- Public API endpoints (Rechtspraak.nl, etc.)
- GitHub Actions workflows (using secrets properly)

### ❌ What is NOT in This Repository
- NPM authentication tokens
- API keys or secrets
- Private credentials
- Database connection strings
- Personal information

## Required GitHub Secrets

The following secrets need to be configured in your repository settings:

### 🔑 Required Secrets
- `NPM_TOKEN` - Your NPM publish token (kept in key vault)
- `CODECOV_TOKEN` - Optional: For coverage reporting

### 🔧 How to Add Secrets
1. Go to GitHub Repository Settings
2. Navigate to "Secrets and variables" > "Actions"
3. Click "New repository secret"
4. Add the required secrets

### 🛡️ Security Best Practices Applied

#### GitHub Actions Security
- ✅ All sensitive data uses `${{ secrets.SECRET_NAME }}`
- ✅ No hardcoded tokens or credentials
- ✅ Minimal permissions principle
- ✅ Secure checkout with token management
- ✅ No secret exposure in logs or outputs

#### NPM Publishing Security
- ✅ Uses NODE_AUTH_TOKEN from secrets
- ✅ Publishes with `--access public` flag
- ✅ No private registry credentials
- ✅ Automated verification before publish

#### Code Security
- ✅ No API keys in source code
- ✅ All external URLs are public
- ✅ Test data uses mock/example values only
- ✅ Input sanitization validated
- ✅ HTTPS enforcement tested

## Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public issue
2. Email: security@mediazone.nl
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if known)

We will respond within 48 hours and provide updates as we investigate.

## Security Scanning

This repository includes:
- ✅ Dependency vulnerability scanning
- ✅ Code security analysis  
- ✅ Input validation testing
- ✅ Secret detection prevention

## License & Legal

- This project is MIT licensed
- No warranty or liability
- For informational purposes only
- Not legal advice - consult qualified legal professionals

---

**🔒 Security is our priority. This public repository contains zero sensitive information.**