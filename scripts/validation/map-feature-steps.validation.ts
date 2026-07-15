import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const FUNCTIONALITIES_DIR = path.join(ROOT, 'functionalities');
const STEP_LINE_REGEX = /^\s*(Given|When|Then|And|But)\s+(.*)$/;
const STEP_DEF_CALL_REGEX = /(Given|When|Then|And|But)\s*\(\s*(["'`])([\s\S]*?)\2\s*,/g;

type StepKeyword = 'Given' | 'When' | 'Then' | 'And' | 'But';

type StepDefinitionMatch = {
  keyword: StepKeyword;
  expression: string;
  regex: RegExp;
  filePath: string;
  line: number;
};

type FeatureStep = {
  line: number;
  keyword: StepKeyword;
  text: string;
  raw: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function unescapeLiteral(value: string, quote: string): string {
  if (quote === '"') {
    try {
      return JSON.parse(`"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`);
    } catch {
      return value;
    }
  }

  return value
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t')
    .replace(/\\r/g, '\r')
    .replace(/\\'/g, "'")
    .replace(/\\`/g, '`')
    .replace(/\\\\/g, '\\');
}

function cucumberExpressionToRegex(expression: string): RegExp {
  const paramPatterns: Record<string, string> = {
    string: '"[^\"]*"|\'[^\']*\'|[^\\s]+',
    int: '[-+]?\\d+',
    float: '[-+]?(?:\\d+\\.\\d+|\\d+|\\.\\d+)',
    word: '\\S+',
  };

  let regexText = '^';
  let cursor = 0;
  const tokenRegex = /\{([^}]+)\}/g;

  let token = tokenRegex.exec(expression);
  while (token) {
    regexText += escapeRegExp(expression.slice(cursor, token.index));
    const paramName = token[1].trim();
    regexText += `(${paramPatterns[paramName] || '.+?'})`;
    cursor = token.index + token[0].length;
    token = tokenRegex.exec(expression);
  }

  regexText += escapeRegExp(expression.slice(cursor));
  regexText += '$';
  return new RegExp(regexText);
}

function lineNumberFromIndex(text: string, index: number): number {
  return text.slice(0, index).split('\n').length;
}

async function walkStepDefinitionFiles(dir: string, output: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkStepDefinitionFiles(fullPath, output);
      continue;
    }

    if (!entry.isFile() || !entry.name.endsWith('.ts')) {
      continue;
    }

    if (
      fullPath.includes(`${path.sep}step-definitions${path.sep}`) ||
      entry.name.endsWith('.steps.ts')
    ) {
      output.push(fullPath);
    }
  }
  return output;
}

async function exists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function walkFeatures(dir: string, output: string[] = []): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkFeatures(fullPath, output);
      continue;
    }

    if (entry.isFile() && entry.name.endsWith('.feature')) {
      output.push(fullPath);
    }
  }
  return output;
}

async function resolveFeaturePath(arg?: string): Promise<string | null> {
  if (!arg) {
    return null;
  }

  if (path.isAbsolute(arg) && (await exists(arg))) {
    return arg;
  }

  const cwdRelative = path.resolve(process.cwd(), arg);
  if (await exists(cwdRelative)) {
    return cwdRelative;
  }

  const rootRelative = path.resolve(ROOT, arg);
  if (await exists(rootRelative)) {
    return rootRelative;
  }

  const targetName = path.basename(arg);
  const featureFiles = await walkFeatures(FUNCTIONALITIES_DIR, []);
  const nameMatches = featureFiles.filter((f) => path.basename(f) === targetName);

  if (nameMatches.length === 1) {
    return nameMatches[0];
  }

  if (nameMatches.length > 1) {
    throw new Error(
      `Multiple feature files match '${targetName}'. Use a more specific path. Matches: ${nameMatches
        .map((p) => path.relative(ROOT, p))
        .join(', ')}`,
    );
  }

  return null;
}

async function loadDefinitions(): Promise<StepDefinitionMatch[]> {
  const files = await walkStepDefinitionFiles(FUNCTIONALITIES_DIR, []);
  const defs: StepDefinitionMatch[] = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');
    let match = STEP_DEF_CALL_REGEX.exec(content);

    while (match) {
      const keyword = match[1] as StepKeyword;
      const quote = match[2];
      const rawExpression = match[3];
      const expression = unescapeLiteral(rawExpression, quote);
      const line = lineNumberFromIndex(content, match.index);

      defs.push({
        keyword,
        expression,
        regex: cucumberExpressionToRegex(expression),
        filePath,
        line,
      });

      match = STEP_DEF_CALL_REGEX.exec(content);
    }

    STEP_DEF_CALL_REGEX.lastIndex = 0;
  }

  return defs;
}

async function parseFeatureSteps(featurePath: string): Promise<FeatureStep[]> {
  const content = await fs.readFile(featurePath, 'utf8');
  const lines = content.split('\n');
  const steps: FeatureStep[] = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i].replace(/\r$/, '');
    const match = line.match(STEP_LINE_REGEX);
    if (!match) {
      continue;
    }

    steps.push({
      line: i + 1,
      keyword: match[1] as StepKeyword,
      text: match[2].trim(),
      raw: line.trim(),
    });
  }

  return steps;
}

function normalizeFeatureStep(
  keyword: StepKeyword,
  text: string,
  previousKeyword: StepKeyword | null,
): { keyword: StepKeyword; text: string } {
  if (keyword === 'And' || keyword === 'But') {
    const resolved = previousKeyword ?? 'Given';
    return { keyword: resolved, text };
  }

  return { keyword, text };
}

function findBestMatches(
  step: { keyword: StepKeyword; text: string },
  defs: StepDefinitionMatch[],
): StepDefinitionMatch[] {
  return defs
    .filter((d) => d.regex.test(step.text))
    .sort((a, b) => a.filePath.localeCompare(b.filePath));
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  if (!arg) {
    console.error('Usage: npm run validate:map-feature-steps -- <path/to/file.feature>');
    process.exit(1);
  }

  const featurePath = await resolveFeaturePath(arg);
  if (!featurePath) {
    throw new Error(`Feature file not found: ${arg}`);
  }

  const defs = await loadDefinitions();
  const featureSteps = await parseFeatureSteps(featurePath);

  let unresolved = 0;
  let prevPrimary: StepKeyword | null = null;

  console.log(`Feature: ${path.relative(ROOT, featurePath)}`);
  console.log(`Total steps: ${featureSteps.length}`);
  console.log('');

  for (const step of featureSteps) {
    const normalized = normalizeFeatureStep(step.keyword, step.text, prevPrimary);
    if (step.keyword !== 'And' && step.keyword !== 'But') {
      prevPrimary = step.keyword;
    }

    const matches = findBestMatches(normalized, defs);
    const prefix = matches.length ? 'OK' : 'MISS';
    console.log(`[${prefix}] ${step.line}: ${step.raw}`);

    if (!matches.length) {
      unresolved += 1;
      continue;
    }

    for (const item of matches.slice(0, 3)) {
      const rel = path.relative(ROOT, item.filePath).split(path.sep).join('/');
      console.log(`      -> ${rel}:${item.line}  (${item.keyword}("${item.expression}"))`);
    }
  }

  console.log('');
  if (unresolved > 0) {
    console.log(`Unresolved steps: ${unresolved}`);
    process.exitCode = 2;
  } else {
    console.log('All steps resolved to step definitions.');
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to map feature steps: ${message}`);
  process.exit(1);
});
