// Test setup file
import { vi } from 'vitest';

// Mock environment variables
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key';

// Mock console in tests
const originalWarn = console.warn;
const originalError = console.error;

if (process.env.CI) {
  console.warn = () => {};
  console.error = () => {};
}

// Cleanup
vi.fn();
