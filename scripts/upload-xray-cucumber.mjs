import fs from 'node:fs';

const reportPath = process.env.CUCUMBER_JSON_PATH || 'reports/cucumber/cucumber-report.json';

if (!fs.existsSync(reportPath)) {
  console.error(`Cucumber JSON report was not found at: ${reportPath}`);
  console.error('Run tests first so the report is generated.');
  process.exit(1);
}

const raw = fs.readFileSync(reportPath, 'utf-8');
const parsed = JSON.parse(raw);

const isCloud = (process.env.XRAY_MODE || 'cloud').toLowerCase() === 'cloud';

async function uploadToXrayCloud() {
  const clientId = process.env.XRAY_CLIENT_ID;
  const clientSecret = process.env.XRAY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('XRAY_CLIENT_ID and XRAY_CLIENT_SECRET are required for XRAY_MODE=cloud.');
  }

  const authResponse = await fetch('https://xray.cloud.getxray.app/api/v2/authenticate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: clientId, client_secret: clientSecret }),
  });

  if (!authResponse.ok) {
    const body = await authResponse.text();
    throw new Error(`Xray auth failed (${authResponse.status}): ${body}`);
  }

  const token = (await authResponse.text()).replace(/^"|"$/g, '');

  const query = new URLSearchParams();
  if (process.env.XRAY_PROJECT_KEY) query.set('projectKey', process.env.XRAY_PROJECT_KEY);
  if (process.env.XRAY_TEST_EXECUTION_KEY) query.set('testExecutionKey', process.env.XRAY_TEST_EXECUTION_KEY);
  if (process.env.XRAY_TEST_PLAN_KEY) query.set('testPlanKey', process.env.XRAY_TEST_PLAN_KEY);

  const url = `https://xray.cloud.getxray.app/api/v2/import/execution/cucumber${query.toString() ? `?${query.toString()}` : ''}`;

  const importResponse = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parsed),
  });

  if (!importResponse.ok) {
    const body = await importResponse.text();
    throw new Error(`Xray import failed (${importResponse.status}): ${body}`);
  }

  const body = await importResponse.text();
  console.log('Xray cloud import successful.');
  console.log(body);
}

async function uploadToXrayServer() {
  const baseUrl = process.env.XRAY_BASE_URL;
  const authToken = process.env.XRAY_AUTH_TOKEN;

  if (!baseUrl || !authToken) {
    throw new Error('XRAY_BASE_URL and XRAY_AUTH_TOKEN are required for XRAY_MODE=server.');
  }

  const importResponse = await fetch(`${baseUrl.replace(/\/$/, '')}/rest/raven/1.0/import/execution/cucumber`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(parsed),
  });

  if (!importResponse.ok) {
    const body = await importResponse.text();
    throw new Error(`Xray server import failed (${importResponse.status}): ${body}`);
  }

  const body = await importResponse.text();
  console.log('Xray server import successful.');
  console.log(body);
}

(async () => {
  if (isCloud) {
    await uploadToXrayCloud();
    return;
  }

  await uploadToXrayServer();
})().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
