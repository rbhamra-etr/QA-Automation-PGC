import fs from 'node:fs';
import { generate } from 'multiple-cucumber-html-reporter';

const jsonFilePath = 'reports/cucumber/cucumber-report.json';
const jsonDir = 'reports/cucumber';
const reportPath = 'reports/cucumber-rich';
const waitTimeoutMs = 20000;
const pollIntervalMs = 500;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function hasCucumberData(raw) {
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

async function waitForCucumberJson() {
  const start = Date.now();

  while (Date.now() - start < waitTimeoutMs) {
    if (fs.existsSync(jsonFilePath)) {
      const raw = fs.readFileSync(jsonFilePath, 'utf8').trim();
      if (raw.length > 0 && hasCucumberData(raw)) {
        return true;
      }
    }

    await sleep(pollIntervalMs);
  }

  return false;
}

if (!(await waitForCucumberJson())) {
  // JSON is missing/empty/unfinished (or no tests executed); skip gracefully.
  process.exit(0);
}

await generate({
  jsonDir,
  reportPath,
  reportName: 'Automation Test Report',
  pageTitle: 'Cucumber Execution Report',
  displayDuration: true,
  displayReportTime: true,
  openReportInBrowser: false,
  metadata: {
    browser: {
      name: 'chrome',
      version: 'auto',
    },
    platform: {
      name: process.platform,
      version: process.version,
    },
  },
});
