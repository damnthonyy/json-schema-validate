import SwaggerParser from '@apidevtools/swagger-parser';
import { ValidationIssue } from '../core/validation-result.types';
import { formatSwaggerParserError } from '../shared/error-formatter';
import { extractPathFromError } from './spec-parser';

/**
 * Validates the spec structure
 * Throws on validation error (caller handles)
 */
export async function validateSpecStructure(spec: object): Promise<void> {
  await SwaggerParser.validate(spec as any);
}

/**
 * Detects circular references in the spec
 * Returns array of issues if circular refs found, empty if not
 */
export async function detectCircularReferences(spec: object): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  try {
    await SwaggerParser.dereference(spec as any, {
      dereference: {
        circular: false,
      },
    });
  } catch (err) {
    const circularError = err instanceof Error ? err.message : String(err);

    const issue: ValidationIssue = {
      path: extractPathFromError(circularError),
      message: circularError,
      severity: 'error',
      source: 'swagger-parser',
    };
    issues.push(issue);
  }

  return issues;
}

/**
 * Dereferences all $refs allowing circular references
 * For use by Spectral validation
 */
export async function dereferenceSpec(spec: object): Promise<unknown> {
  try {
    const dereffed = await SwaggerParser.dereference(spec as any, {
      dereference: {
        circular: true,
      },
    });
    return dereffed;
  } catch (err) {
    return spec;
  }
}
