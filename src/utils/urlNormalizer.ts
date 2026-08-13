/**
 * QRForge Browser-Style URL Normalizer & Validator
 * Single Source of Truth for URL normalization, validation, and payload encoding.
 */

export interface URLNormalizationResult {
  rawInput: string;
  normalizedUrl: string;
  isValid: boolean;
  status: 'valid' | 'missing_protocol' | 'invalid' | 'empty';
  helperMessage: string;
}

/**
 * Regex patterns for domain/host validation
 */
const DOMAIN_OR_IP_REGEX = /^(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(?::\d+)?(?:\/.*)?$/;
const LOCALHOST_REGEX = /^localhost(?::\d+)?(?:\/.*)?$/i;
const IP_ADDRESS_REGEX = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?(?:\/.*)?$/;

/**
 * Normalizes user typed URL inputs like a modern web browser.
 */
export const normalizeUrlInput = (input: string): URLNormalizationResult => {
  const rawInput = input;
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      rawInput,
      normalizedUrl: '',
      isValid: false,
      status: 'empty',
      helperMessage: 'HTTPS is added automatically when needed.',
    };
  }

  // Case 1: Input already specifies protocol (http:// or https://)
  if (/^https?:\/\//i.test(trimmed)) {
    try {
      const parsed = new URL(trimmed);
      return {
        rawInput,
        normalizedUrl: parsed.toString(),
        isValid: true,
        status: 'valid',
        helperMessage: '✓ Valid website address',
      };
    } catch {
      return {
        rawInput,
        normalizedUrl: trimmed,
        isValid: false,
        status: 'invalid',
        helperMessage: '⚠ Please enter a valid domain or URL',
      };
    }
  }

  // Case 2: Reject plain text without dots/IP/localhost (e.g. "hello world", "test", "my website")
  const isDomain = DOMAIN_OR_IP_REGEX.test(trimmed);
  const isLocalhost = LOCALHOST_REGEX.test(trimmed);
  const isIP = IP_ADDRESS_REGEX.test(trimmed);

  if (!isDomain && !isLocalhost && !isIP) {
    return {
      rawInput,
      normalizedUrl: trimmed,
      isValid: false,
      status: 'invalid',
      helperMessage: '⚠ Please enter a valid domain or URL',
    };
  }

  // Prepend https://
  const candidateUrl = `https://${trimmed}`;
  try {
    const parsed = new URL(candidateUrl);
    return {
      rawInput,
      normalizedUrl: parsed.toString(),
      isValid: true,
      status: 'missing_protocol',
      helperMessage: `✓ Encoded target: ${parsed.toString()}`,
    };
  } catch {
    return {
      rawInput,
      normalizedUrl: candidateUrl,
      isValid: false,
      status: 'invalid',
      helperMessage: '⚠ Please enter a valid domain or URL',
    };
  }
};
