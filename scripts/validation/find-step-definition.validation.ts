import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const FUNCTIONALITIES_DIR = path.join(ROOT, 'functionalities');
const KEYWORDS = ['Given', 'When', 'Then', 'And', 'But'] as const;
const STEP_DEF_CALL_REGEX = /(Given|When|Then|And|But)\s*\(\s*(["'`])([\s\S]*?)\2\s*,/g;

type StepKeyword = 'Given' | 'When' | 'Then' | 'And' | 'But';

type StepMatch = {
  keyword: StepKeyword;
  expression: string;
  filePath: string;
  line: number;
  exact: boolean;
};

function printUsage(): void {
  console.log('Usage: npm run validate:find-step-definition -- "<feature step text>"');
  console.log('Example: npm run validate:find-step-definition -- "When I send a GET request to \"/health\""');
}

function normalizeInputStep(raw: string): string {
  let step = String(raw || '').trim();
  for (const keyword of KEYWORDS) {
    if (step.startsWith(`${keyword} `)) {
      step = step.slice(keyword.length).trim();
      break;
    }
  }
  return step;
}

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
  let match = tokenRegex.exec(expression);

  while (match) {
    regexText += escapeRegExp(expression.slice(cursor, match.index));
    const paramName = match[1].trim();
    regexText += `(${paramPatterns[paramName] || '.+?'})`;
    cursor = match.index + match[0].length;
    match = tokenRegex.exec(expression);
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

async function findMatches(stepText: string): Promise<StepMatch[]> {
  const files = await walkStepDefinitionFiles(FUNCTIONALITIES_DIR, []);
  const matches: StepMatch[] = [];

  for (const filePath of files) {
    const content = await fs.readFile(filePath, 'utf8');

    let match = STEP_DEF_CALL_REGEX.exec(content);
    while (match) {
      const keyword = match[1] as StepKeyword;
      const quote = match[2];
      const rawExpression = match[3];
      const expression = unescapeLiteral(rawExpression, quote);
      const line = lineNumberFromIndex(content, match.index);

      const exact = expression === stepText;
      const regex = cucumberExpressionToRegex(expression);
      const regexMatch = regex.test(stepText);

      if (exact || regexMatch) {
        matches.push({ keyword, expression, filePath, line, exact });
      }

      match = STEP_DEF_CALL_REGEX.exec(content);
    }

    STEP_DEF_CALL_REGEX.lastIndex = 0;
  }

  return matches.sort((a, b) => {
    if (a.exact !== b.exact) {
      return a.exact ? -1 : 1;
    }
    return a.filePath.localeCompare(b.filePath);
  });
}

async function main(): Promise<void> {
  const rawInput = process.argv.slice(2).join(' ').trim();
  if (!rawInput) {
    printUsage();
    process.exitCode = 1;
    return;
  }

  const stepText = normalizeInputStep(rawInput);
  const matches = await findMatches(stepText);

  if (!matches.length) {
    console.log(`No matching step definition found for: ${stepText}`);
    process.exitCode = 2;
    return;
  }

  console.log(`Step: ${stepText}`);
  console.log(`Matches found: ${matches.length}`);
  console.log('');

  for (const item of matches) {
    const rel = path.relative(ROOT, item.filePath).split(path.sep).join('/');
    const kind = item.exact ? 'exact' : 'cucumber-expression';
    console.log(`[${kind}] ${item.keyword}("${item.expression}")`);
    console.log(`  -> ${rel}:${item.line}`);
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Failed to search step definitions: ${message}`);
  process.exitCode = 1;
});
