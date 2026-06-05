import { ValidationIssue } from '../core/validation-result.types';

/**
 * Parse and validate input spec
 * Returns null if not a valid spec object
 */
export function parseSpec(spec: unknown): object | null {
  if (typeof spec !== 'object' || spec === null) {
    return null;
  }
  return spec as object;
}

/**
 * Extract meaningful path from error messages
 */
export function extractPathFromError(errorMessage: string): string {
  // Try to match JSON Pointer paths like #/components/schemas/Pet
  const pathMatch = errorMessage.match(/#\/[^\s"',}]*/);
  if (pathMatch) {
    return pathMatch[0];
  }

  // Try to match quoted paths
  const quotedMatch = errorMessage.match(/"(#\/[^"]+)"/);
  if (quotedMatch) {
    return quotedMatch[1];
  }

  // Default to root if no specific path found
  return '#/';
}
