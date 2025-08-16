# Security Policy

## 🛡️ Security Statement

The Dutch Legal MCP Server is designed with security and legal compliance as top priorities. We take security vulnerabilities seriously and appreciate responsible disclosure.

## ⚠️ Important Disclaimer

**This tool provides legal research assistance only and does not constitute legal advice.**

Users are fully responsible for:
- All actions performed by this tool
- Compliance with applicable terms of service and laws
- Ensuring data accuracy, authority, and legitimate use
- All legal implications and consequences of usage

## 🔒 Supported Versions

We provide security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 2.0.14  | ✅ Current version |
| < 2.0.14| ❌ Not supported   |

## 🚨 Reporting a Vulnerability

### Private Vulnerability Reporting (Preferred)

Use GitHub's private vulnerability reporting feature:

1. Go to the [Security tab](https://github.com/mediazone/dutch-legal-mcp/security)
2. Click "Report a vulnerability"
3. Fill in the details using the template

### Alternative Contact

If you cannot use GitHub's reporting feature, you can:

1. **Create a private issue** with the `security` label
2. **Include the following information:**
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if any)

## ⏱️ Response Timeline

- **Initial Response:** Within 48 hours
- **Triage:** Within 1 week
- **Resolution:** Depends on severity
  - **Critical:** Within 7 days
  - **High:** Within 14 days
  - **Medium:** Within 30 days
  - **Low:** Next regular release

## 🎯 Security Scope

### In Scope
- Code execution vulnerabilities
- Data injection attacks
- Authentication/authorization bypasses
- Information disclosure vulnerabilities
- Dependencies with known vulnerabilities

### Out of Scope
- Social engineering attacks
- Physical security issues
- Denial of service attacks on public APIs
- Issues in dependencies that don't affect this project
- Legal compliance questions (these are user responsibility)

## 🛠️ Security Measures

### Automated Security
- **Dependabot alerts** for vulnerable dependencies
- **CodeQL analysis** for code vulnerabilities
- **Private vulnerability reporting** enabled
- **Regular security audits** via `npm audit`

### Manual Security
- **Code review** process for all changes
- **Minimal dependencies** to reduce attack surface
- **Input validation** with Zod schemas
- **Error handling** to prevent information leakage

## ⚖️ Legal Considerations

This tool accesses public legal data from:
- **Rechtspraak.nl** (Dutch court decisions)
- **EU legal frameworks** (GDPR, AI Act)

**Security responsibilities:**
- **Users** are responsible for legitimate use of API endpoints
- **Users** must comply with all applicable terms of service
- **Tool authors** provide software "AS IS" without warranties

## 📝 Security Best Practices for Users

1. **Keep dependencies updated**: Use `npm audit` regularly
2. **Validate all inputs**: Don't trust external data sources
3. **Review legal recommendations**: This tool provides research assistance only
4. **Secure your environment**: Protect your API keys and credentials
5. **Monitor usage**: Be aware of what data you're processing

## 🚫 No Warranty

This software is provided "AS IS" without any warranties. Authors are not liable for any security issues, data loss, legal problems, or damages arising from usage.

---

**🔒 Report responsibly, stay secure, and remember: YOU are responsible for all tool usage.**