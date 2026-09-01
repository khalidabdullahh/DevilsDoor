# Security Policy

## Supported Versions

We actively maintain security updates for the following versions of Devil's Door:

| Version | Supported          |
| ------- | ------------------ |
| 0.1.x   | :white_check_mark: |
| < 0.1.0 | :x:                |

## Reporting a Vulnerability

We take the security and integrity of Devil's Door and its players very seriously.

If you discover a security vulnerability, telemetry leak, or potential exploit:

1. **Do Not File a Public Issue**: Please do not open a public GitHub issue detailing the vulnerability.
2. **Contact the Lead Maintainer**: Contact Khalid Abdullah directly through private repository security advisories on GitHub.
3. **Information to Include**:
   - Description of the vulnerability or exploit.
   - Steps to reproduce or proof-of-concept code.
   - Potential impact on users, infrastructure, or deployment pipelines.

## Secrets and Sensitive Data Protection

- Never commit API keys, secrets, cloud credentials, or analytics tokens to this repository.
- Use environment variables for deployment targets.
- Any accidentally committed secrets must be rotated immediately and invalidated.
