# Security Policy

## Reporting a Vulnerability

We take the security of our application seriously. If you discover a security vulnerability, please help us by reporting it responsibly rather than disclosing it publicly.

### How to Report

**Please do not open a public issue for security vulnerabilities.**

Instead, email your findings to the repository maintainers with the following information:

1. **Description**: A clear description of the vulnerability
2. **Location**: The affected file(s) or component(s)
3. **Steps to Reproduce**: Detailed steps to demonstrate the vulnerability
4. **Impact**: The potential impact of this vulnerability
5. **Suggested Fix**: Any suggested remediation (optional but appreciated)

Include the version(s) of the application affected in your report.

### What to Expect

- We will acknowledge receipt of your report within 48 hours
- We will work to understand and reproduce the vulnerability
- We will keep you informed of progress toward a fix
- We will release a patch as soon as possible
- We will credit you as the reporter when publicly disclosing the vulnerability (unless you prefer to remain anonymous)

## Supported Versions

We recommend always using the latest version of the application. Security updates are provided for:

- **Latest release**: Full support for all security issues
- **Previous versions**: Limited support; users are encouraged to update to the latest version

## Security Practices

### Application Security

- **Input Validation**: All user inputs are validated and sanitized
- **Sensitive Data**: Environment variables and API credentials are stored securely using `.env` files (never committed to the repository)
- **Dependencies**: Regular audits of dependencies for known vulnerabilities
- **API Security**: The application uses secure communication over HTTPS

### Third-Party Integrations

This application integrates with external services (e.g., Relevance AI). We recommend:

- Keeping credentials secure in environment variables
- Rotating API keys periodically
- Monitoring API usage for suspicious activity

### Development Environment

- Use `.env.example` as a template for local configuration
- Never commit `.env` or other files containing sensitive credentials
- Review the `.gitignore` file to ensure sensitive files are not tracked

## Security Awareness

All contributors are responsible for:

- Keeping dependencies up to date
- Following secure coding practices
- Being cautious with third-party libraries
- Reporting suspected vulnerabilities immediately

## Additional Resources

- [OWASP Security Guidelines](https://owasp.org/)
- [Node.js Security](https://nodejs.org/en/docs/guides/security/)
- [npm Security Guide](https://docs.npmjs.com/cli/v8/commands/npm-audit)

## Disclaimer

This security policy is a best-effort initiative. While we work diligently to ensure the security of this application, no system is completely secure. We appreciate your cooperation in responsibly disclosing any vulnerabilities.

---

**Last Updated**: April 2026

Thank you for helping keep our application safe and secure.
