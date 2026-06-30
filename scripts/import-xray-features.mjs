/**
 * import-xray-features.mjs
 *
 * Imports one or more Gherkin .feature files into Xray Cloud as Test issues.
 * Reads credentials from the active env file (ENV=qa by default).
 *
 * Usage:
 *   node scripts/import-xray-features.mjs [featureFileOrFolder] [--folder "Repo/Path"]
 *
 * Examples:
 *   node scripts/import-xray-features.mjs features/sfdc/user-list.sfdc.feature
 *   node scripts/import-xray-features.mjs features/sfdc/user-list.sfdc.feature --folder "AI Test Case Generation/User"
 *   node scripts/import-xray-features.mjs features/web --folder "Web"
 *   ENV=uat node scripts/import-xray-features.mjs features/sfdc/user-list.sfdc.feature
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// ---------------------------------------------------------------------------
// Load env file
// ---------------------------------------------------------------------------
const env = (process.env.ENV ?? 'qa').toLowerCase();
const envFile = path.join(root, `.env.${env}`);
if (!fs.existsSync(envFile)) {
  console.error(`Env file not found: ${envFile}`);
  process.exit(1);
}
dotenv.config({ path: envFile });
console.log(`Loaded: ${envFile}`);

// ---------------------------------------------------------------------------
// Parse CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
let featurePath = null;
let testRepositoryPath = null;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--folder' && args[i + 1]) {
    testRepositoryPath = args[i + 1];
    i++;
  } else if (!featurePath) {
    featurePath = args[i];
  }
}

if (!featurePath) {
  console.error('Usage: node scripts/import-xray-features.mjs <featureFileOrFolder> [--folder "Repo/Folder"]');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Collect .feature files
// ---------------------------------------------------------------------------
const resolvedPath = path.resolve(root, featurePath);
if (!fs.existsSync(resolvedPath)) {
  console.error(`Path not found: ${resolvedPath}`);
  process.exit(1);
}

const featureFiles = [];
const stat = fs.statSync(resolvedPath);
if (stat.isDirectory()) {
  for (const file of fs.readdirSync(resolvedPath)) {
    if (file.endsWith('.feature')) {
      featureFiles.push(path.join(resolvedPath, file));
    }
  }
} else {
  featureFiles.push(resolvedPath);
}

if (featureFiles.length === 0) {
  console.error(`No .feature files found at: ${resolvedPath}`);
  process.exit(1);
}
console.log(`Found ${featureFiles.length} feature file(s) to import.`);

// ---------------------------------------------------------------------------
// Validate credentials
// ---------------------------------------------------------------------------
const clientId = process.env.XRAY_CLIENT_ID;
const clientSecret = process.env.XRAY_CLIENT_SECRET;
const projectKey = process.env.XRAY_PROJECT_KEY || 'QA';

if (!clientId || !clientSecret) {
  console.error('XRAY_CLIENT_ID and XRAY_CLIENT_SECRET are required.');
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Authenticate with Xray Cloud
// ---------------------------------------------------------------------------
console.log('Authenticating with Xray Cloud...');
const authResponse = await fetch('https://xray.cloud.getxray.app/api/v2/authenticate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
});

if (!authResponse.ok) {
  const body = await authResponse.text();
  console.error(`Xray auth failed (${authResponse.status}): ${body}`);
  process.exit(1);
}

const xrayToken = (await authResponse.text()).replace(/^"|"$/g, '');
console.log('Xray auth OK.');

// ---------------------------------------------------------------------------
// Build testInfo — include any required custom fields from env
// ---------------------------------------------------------------------------
const testInfoFields = {};

// Support injecting custom fields via env vars: XRAY_CUSTOM_FIELD_<ID>=value1,value2
for (const [key, val] of Object.entries(process.env)) {
  const match = key.match(/^XRAY_CUSTOM_FIELD_(\d+)$/);
  if (match) {
    const fieldId = `customfield_${match[1]}`;
    testInfoFields[fieldId] = val.split(',').map(v => v.trim());
  }
}

const testInfo = Object.keys(testInfoFields).length > 0
  ? JSON.stringify({ fields: testInfoFields })
  : null;

if (testInfo) {
  console.log(`testInfo custom fields: ${Object.keys(testInfoFields).join(', ')}`);
}

// ---------------------------------------------------------------------------
// Import each feature file
// ---------------------------------------------------------------------------
const results = [];

for (const featureFile of featureFiles) {
  const fileName = path.relative(root, featureFile);
  console.log(`\nImporting: ${fileName}`);

  const params = new URLSearchParams({ projectKey });
  if (testRepositoryPath) {
    // Xray Cloud requires an absolute path with a leading slash
    const absPath = testRepositoryPath.startsWith('/') ? testRepositoryPath : `/${testRepositoryPath}`;
    params.set('testRepositoryPath', absPath);
  }

  const url = `https://xray.cloud.getxray.app/api/v2/import/feature?${params.toString()}`;

  const form = new FormData();
  const fileContent = fs.readFileSync(featureFile);
  const blob = new Blob([fileContent], { type: 'text/plain' });
  form.append('file', blob, path.basename(featureFile));

  if (testInfo) {
    form.append('testInfo', new Blob([testInfo], { type: 'application/json' }), 'testInfo.json');
  }

  const importResponse = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${xrayToken}` },
    body: form,
  });

  const responseText = await importResponse.text();

  if (!importResponse.ok) {
    console.error(`  FAILED (${importResponse.status}): ${responseText}`);
    results.push({ file: fileName, status: 'FAILED', error: responseText });
    continue;
  }

  let parsed;
  try {
    parsed = JSON.parse(responseText);
  } catch {
    parsed = responseText;
  }

  const updatedKeys = parsed?.updatedOrCreatedTests?.map(t => t.key) ?? [];
  const precondKeys = parsed?.updatedOrCreatedPreconditions?.map(p => p.key) ?? [];
  const errors = parsed?.errors ?? [];

  if (updatedKeys.length > 0) {
    console.log(`  Created/Updated Tests: ${updatedKeys.join(', ')}`);
  }
  if (precondKeys.length > 0) {
    console.log(`  Preconditions: ${precondKeys.join(', ')}`);
  }
  if (errors.length > 0) {
    console.warn(`  Errors: ${JSON.stringify(errors)}`);
  }
  if (updatedKeys.length === 0 && errors.length === 0) {
    console.log(`  Response: ${responseText}`);
  }

  results.push({ file: fileName, status: 'OK', tests: updatedKeys, errors });
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
console.log('\n========== SUMMARY ==========');
for (const r of results) {
  const label = r.status === 'OK' ? `OK  [${r.tests?.join(', ') || 'no keys'}]` : `FAIL ${r.error}`;
  console.log(`  ${r.file}: ${label}`);
}

const failed = results.filter(r => r.status !== 'OK');
process.exit(failed.length > 0 ? 1 : 0);
