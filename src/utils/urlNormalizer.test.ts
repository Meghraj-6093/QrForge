import { normalizeUrlInput } from './urlNormalizer';

/**
 * QRForge URL Normalizer Unit Test Suite
 */
const testCases = [
  { input: 'github.com', expectedUrl: 'https://github.com/', expectedStatus: 'missing_protocol', expectedValid: true },
  { input: 'www.github.com', expectedUrl: 'https://www.github.com/', expectedStatus: 'missing_protocol', expectedValid: true },
  { input: 'hyperionweb.vercel.app', expectedUrl: 'https://hyperionweb.vercel.app/', expectedStatus: 'missing_protocol', expectedValid: true },
  { input: 'github.com/user/repo', expectedUrl: 'https://github.com/user/repo', expectedStatus: 'missing_protocol', expectedValid: true },
  { input: 'github.com/user/repo?tab=repositories', expectedUrl: 'https://github.com/user/repo?tab=repositories', expectedStatus: 'missing_protocol', expectedValid: true },
  { input: 'example.com:8080', expectedUrl: 'https://example.com:8080/', expectedStatus: 'missing_protocol', expectedValid: true },
  { input: 'https://github.com', expectedUrl: 'https://github.com/', expectedStatus: 'valid', expectedValid: true },
  { input: 'http://example.com', expectedUrl: 'http://example.com/', expectedStatus: 'valid', expectedValid: true },
  { input: 'localhost:3000', expectedUrl: 'https://localhost:3000/', expectedStatus: 'missing_protocol', expectedValid: true },
  { input: '192.168.1.10:3000', expectedUrl: 'https://192.168.1.10:3000/', expectedStatus: 'missing_protocol', expectedValid: true },
  { input: '', expectedUrl: '', expectedStatus: 'empty', expectedValid: false },
  { input: '   ', expectedUrl: '', expectedStatus: 'empty', expectedValid: false },
  { input: 'hello world', expectedUrl: 'hello world', expectedStatus: 'invalid', expectedValid: false },
  { input: 'my website', expectedUrl: 'my website', expectedStatus: 'invalid', expectedValid: false },
  { input: '   github.com   ', expectedUrl: 'https://github.com/', expectedStatus: 'missing_protocol', expectedValid: true },
];

let passed = 0;
let failed = 0;

console.log('--- Running QRForge URL Normalizer Unit Tests ---');

testCases.forEach(({ input, expectedUrl, expectedStatus, expectedValid }, idx) => {
  const result = normalizeUrlInput(input);
  const isUrlMatch = result.normalizedUrl === expectedUrl;
  const isStatusMatch = result.status === expectedStatus;
  const isValidMatch = result.isValid === expectedValid;

  if (isUrlMatch && isStatusMatch && isValidMatch) {
    console.log(`[PASS] Case #${idx + 1}: "${input}" -> "${result.normalizedUrl}" (${result.status})`);
    passed++;
  } else {
    console.error(`[FAIL] Case #${idx + 1}: "${input}"`);
    console.error(`  Expected: url="${expectedUrl}", status="${expectedStatus}", valid=${expectedValid}`);
    console.error(`  Received: url="${result.normalizedUrl}", status="${result.status}", valid=${result.isValid}`);
    failed++;
  }
});

console.log(`\nTest Summary: ${passed} passed, ${failed} failed out of ${testCases.length} tests.`);

if (failed > 0) {
  throw new Error(`${failed} unit tests failed`);
}
