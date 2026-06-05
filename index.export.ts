/**
 * JSON Schema & OpenAPI Validator
 *
 * Main package exports for use as an npm library
 */

export { validateSchema } from './validators/openapi-schema.validator';

export type { ValidationResult, ValidationIssue } from './core/validation-result.types';
