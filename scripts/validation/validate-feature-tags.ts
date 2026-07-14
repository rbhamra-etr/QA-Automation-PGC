import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const functionalitiesRoot = path.join(projectRoot, 'functionalities');

function getAllFeatureFiles(dir: string): string[] {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files: string[] = [];

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

function getTagLines(content: string): string[] {
  const lines = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const tagLines: string[] = [];
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

function validate(): void {
  if (!fs.existsSync(functionalitiesRoot)) {
    console.error('functionalities folder not found.');
    process.exit(1);
  }

  const featureFiles: string[] = [];
  for (const entry of fs.readdirSync(functionalitiesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) {
      continue;
    }

    const featureDir = path.join(functionalitiesRoot, entry.name, 'features');
    if (fs.existsSync(featureDir)) {
      featureFiles.push(...getAllFeatureFiles(featureDir));
    }
  }
  const violations: Array<{ relativePath: string; expectedTag: string; allTags: string[] }> = [];

  for (const filePath of featureFiles) {
    const relativePath = path.relative(projectRoot, filePath).replace(/\\/g, '/');
    const appFolder = path.basename(path.dirname(path.dirname(filePath)));
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
    console.error('Each feature must include a tag that matches its module folder under functionalities.');
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
