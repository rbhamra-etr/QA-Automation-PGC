export function generateReference(prefix: string = 'REF'): string {
  // Dummy unique reference generator for test data
  return `${prefix}-${Date.now()}`;
}

export function buildDummyUser(overrides?: Partial<{ email: string; password: string; role: string }>): {
  email: string;
  password: string;
  role: string;
} {
  const baseUser = {
    email: 'test.user@example.com',
    password: 'Password@123',
    role: 'user',
  };

  return {
    ...baseUser,
    ...overrides,
  };
}
