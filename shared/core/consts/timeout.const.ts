const toPositiveNumber = (value: string | undefined, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const defaultTimeoutMs = toPositiveNumber(
  process.env['DEFAULT_TIMEOUT_MS'] ?? process.env['DEFAULT_TIMEOUT'],
  30_000,
);

export const TIMEOUTS = {
  DEFAULT: defaultTimeoutMs,
  FIVE_SECONDS: 5_000,
  TEN_SECONDS: 10_000,
  FIFTEEN_SECONDS: 15_000,
  TWENTY_SECONDS: 20_000,
  THIRTY_SECONDS: 30_000,
  FORTY_FIVE_SECONDS: 45_000,
  ONE_MINUTE: 60_000,
  TWO_MINUTES: 120_000,
} as const;
