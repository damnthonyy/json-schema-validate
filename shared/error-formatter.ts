import { ValidationIssue } from '../core/validation-result.types';

export function formatSwaggerParserError(err: Error): ValidationIssue[] {
  const message = err.message || 'Unknown swagger-parser error';

  let path = '#/';
  const pathMatch = message.match(/(?:at )?(#[^\s]*)/);
  if (pathMatch) {
    path = pathMatch[1];
  }

  return [
    {
      path,
      message,
      severity: 'error',
      source: 'swagger-parser',
    },
  ];
}

export function formatSpectralResults(results: any[]): ValidationIssue[] {
  return results.map((result) => {
    let path = '#/';
    if (result.path && Array.isArray(result.path) && result.path.length > 0) {
      path = '#/' + result.path.map((p: string | number) => String(p)).join('/');
    }

    const severityMap: Record<number, 'error' | 'warning' | 'info'> = {
      0: 'error',
      1: 'warning',
      2: 'info',
      3: 'info',
    };

    return {
      path,
      message: result.message,
      severity: severityMap[result.severity ?? 0] || 'error',
      source: 'spectral',
    };
  });
}
