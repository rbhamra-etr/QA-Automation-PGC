export function logInfo(message: string): void {
  // Dummy logger utility for quick tracing in tests
  console.log(`[INFO] ${message}`);
}

export function logStep(step: string): void {
  // Dummy step logger to make scenario flow easy to follow
  console.log(`[STEP] ${step}`);
}

export function logError(message: string): void {
  // Dummy error logger for failure visibility
  console.error(`[ERROR] ${message}`);
}
