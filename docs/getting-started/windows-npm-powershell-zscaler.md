# Windows npm + PowerShell + Zscaler Troubleshooting

Use this guide if npm commands fail on a corporate Windows machine due to execution policy or certificate trust issues.

## When To Use This

Typical symptoms:

- npm command is blocked in PowerShell (execution policy error)
- npm install fails with TLS/SSL/certificate errors
- Corporate proxy inspection is enabled (for example, Zscaler)

## Step 1: Update PowerShell Execution Policy

Run PowerShell as your normal user and execute:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Then follow the on-screen confirmation prompts.

## Step 2: Export The Corporate Root Certificate (Zscaler)

1. Press Win+R.
2. Enter `certmgr.msc` and press Enter.
3. Expand Trusted Root Certification Authorities.
4. Select Certificates.
5. Scroll down and find Zscaler Root CA certificates (often 2 entries).
6. Right-click a required Zscaler Root CA certificate.
7. Select All Tasks > Export.
8. Complete export as needed (for npm CA usage, export in Base-64 encoded format).
9. Save the certificate file to a local path, for example: `C:\certs\zscaler.pem`.

## Step 3: Configure npm To Use The Exported CA File

```powershell
npm config set cafile "C:\certs\zscaler.pem"
```

## Step 4: Verify

```powershell
npm config get cafile
npm install
```

If install still fails, contact your IT/security team with the exact npm error output.

## Security Notes

- Follow company security policy before changing execution policy.
- Use only approved corporate certificates.
- Do not commit certificate files or machine-specific paths to the repository.
