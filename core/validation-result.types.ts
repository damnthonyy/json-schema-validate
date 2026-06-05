export interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  source: 'swagger-parser' | 'spectral';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}
