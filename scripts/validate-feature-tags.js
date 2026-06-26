const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const featuresRoot = path.join(projectRoot, 'features');

function getAllFeatureFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...getAllFeatureFiles(fullPath));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.feature')) {
      files.push(fullPath);
    }
  }

  return files;
}

function getTagLines(content) {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const tagLines = [];
  for (const line of lines) {
    if (line.startsWith('@')) {
      tagLines.push(line);
      continue;
    }

    if (/^Feature\s*:/i.test(line)) {
      break;
    }
  }

  return tagLines;
}

function validate() {
  if (!fs.existsSync(featuresRoot)) {
    console.error('features folder not found.');
    process.exit(1);
  }

  const featureFiles = getAllFeatureFiles(featuresRoot);
  const violations = [];

  for (const filePath of featureFiles) {
    const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
    const appFolder = path.basename(path.dirname(filePath));
    const expectedTag = `@${appFolder}`;

    const content = fs.readFileSync(filePath, 'utf8');
    const tagLines = getTagLines(content);
    const allTags = tagLines
      .flatMap((line) => line.split(/\s+/))
      .filter((token) => token.startsWith('@'));

    if (!allTags.includes(expectedTag)) {
      violations.push({ relativePath, expectedTag, allTags });
    }
  }

  if (violations.length > 0) {
    console.error('Feature tag validation failed.');
    console.error('Each feature must include a tag that matches its folder under features.');
    console.error('');

    for (const violation of violations) {
      const foundTags = violation.allTags.length > 0 ? violation.allTags.join(', ') : '(none)';
      console.error(`- ${violation.relativePath}`);
      console.error(`  expected: ${violation.expectedTag}`);
      console.error(`  found: ${foundTags}`);
    }

    process.exit(1);
  }

  console.log(`Feature tag validation passed for ${featureFiles.length} file(s).`);
}

validate();
