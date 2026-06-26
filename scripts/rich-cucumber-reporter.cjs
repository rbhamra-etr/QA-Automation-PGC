const { execFileSync } = require('node:child_process');
const path = require('node:path');

class RichCucumberReporter {
  onEnd() {
    const scriptPath = path.resolve(process.cwd(), 'scripts/generate-rich-cucumber-report.mjs');

    try {
      execFileSync(process.execPath, [scriptPath], {
        stdio: 'inherit',
        env: process.env,
      });
    } catch (error) {
      console.error('Failed to generate rich cucumber report:', error);
    }
  }
}

module.exports = RichCucumberReporter;
