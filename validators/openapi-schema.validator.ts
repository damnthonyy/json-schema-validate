import { ValidationResult, ValidationIssue } from '../core/validation-result.types';
import { parseSpec } from './spec-parser';
import { validateSpecStructure, detectCircularReferences, dereferenceSpec } from './spec-validator';
import { analyzeWithSpectral } from './spectral-analyzer';

/**
 * Main validation orchestrator
 * Combines structural validation (swagger-parser) + rule-based validation (Spectral)
 */
export async function validateSchema(spec: unknown): Promise<ValidationResult> {
  const issues: ValidationIssue[] = [];

  // Step 1: Parse input
  const parsedSpec = parseSpec(spec);
  if (!parsedSpec) {
    return {
      valid: false,
      issues: [
        {
          path: '#/',
          message: 'Input must be a valid JSON object',
          severity: 'error',
          source: 'swagger-parser',
        },
      ],
    };
  }

  // Step 2: Validate basic structure
  try {
    await validateSpecStructure(parsedSpec);
  } catch (err) {
    const errorMsg = (err as Error).message;
    issues.push({
      path: '#/',
      message: errorMsg,
      severity: 'error',
      source: 'swagger-parser',
    });
  }

  // Step 3: Detect circular references
  const circularIssues = await detectCircularReferences(parsedSpec);
  issues.push(...circularIssues);

  // Step 4: Dereference for Spectral analysis
  const dereffed = await dereferenceSpec(parsedSpec);

  // Step 5: Run Spectral validation
  const spectralIssues = await analyzeWithSpectral(dereffed);
  issues.push(...spectralIssues);

  // Step 6: Sort by severity (errors first, then warnings, then info)
  const severityOrder = { error: 0, warning: 1, info: 2 };
  issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return {
    valid: issues.filter((i) => i.severity === 'error').length === 0,
    issues,
  };
}
