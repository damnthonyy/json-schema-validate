import SwaggerParser from '@apidevtools/swagger-parser';
import { ValidationIssue } from '../core/validation-result.types';
import { formatSwaggerParserError } from '../shared/error-formatter';
import { extractPathFromError } from './spec-parser';

/**
 * Validates the spec structure
 * Throws on validation error (caller handles)
 */
export async function validateSpecStructure(spec: object): Promise<void> {
  try {
    await SwaggerParser.validate(spec as any);
    console.log('Basic validation passed');
  } catch (err) {
    console.error('Basic validation failed:', (err as Error).message);
    throw err;
  }
}

/**
 * Detects circular references in the spec
 * Returns array of issues if circular refs found, empty if not
 */
export async function detectCircularReferences(spec: object): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  try {
    console.log('Checking for circular references...');
    await SwaggerParser.dereference(spec as any, {
      dereference: {
        circular: false,
      },
    });
    console.log('No circular references detected');
  } catch (err) {
    const circularError = err instanceof Error ? err.message : String(err);
    console.warn('Circular reference detected:', circularError);

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
    console.log('Dereferencing spec (circular refs allowed)...');
    const dereffed = await SwaggerParser.dereference(spec as any, {
      dereference: {
        circular: true,
      },
    });
    console.log('Dereferenced successfully');
    return dereffed;
  } catch (err) {
    console.warn('Dereference failed, using original spec');
    return spec;
  }
}
