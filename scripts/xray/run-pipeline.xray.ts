import { spawnSync } from 'node:child_process';

type ParsedArgs = {
  shouldUploadEvidence: boolean;
  passThroughArgs: string[];
};

function parseArgs(args: string[]): ParsedArgs {
  const passThroughArgs: string[] = [];
  let shouldUploadEvidence = false;

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];

    if (arg === '--upload-evidence') {
      shouldUploadEvidence = true;
      continue;
    }

    passThroughArgs.push(arg);
  }

  return {
    shouldUploadEvidence,
    passThroughArgs,
  };
}

function runStep(label: string, scriptPath: string, args: string[]): void {
  console.log(`\n==> ${label}`);

  const result = spawnSync(
    process.execPath,
    ['-r', 'ts-node/register', scriptPath, ...args],
    {
      stdio: 'inherit',
      env: process.env,
    },
  );

  if (result.status !== 0) {
    throw new Error(`${label} failed with exit code ${result.status ?? 1}`);
  }
}

function main(): void {
  const { shouldUploadEvidence, passThroughArgs } = parseArgs(process.argv.slice(2));

  runStep('Create/reuse Xray execution', 'scripts/xray/create-test-execution.xray.ts', passThroughArgs);
  runStep('Import Cucumber results to Xray', 'scripts/xray/sync-test-runs.xray.ts', passThroughArgs);

  if (shouldUploadEvidence) {
    runStep('Upload evidence to Xray', 'scripts/xray/upload-test-evidence.xray.ts', passThroughArgs);
  } else {
    console.log('\nSkipping evidence upload (add --upload-evidence to enable).');
  }

  console.log('\nXray pipeline flow completed.');
}

try {
  main();
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Fatal: ${message}`);
  process.exit(1);
}
