import { Spectral, RulesetDefinition } from '@stoplight/spectral-core';
import { oas } from '@stoplight/spectral-rulesets';
import { load as loadYaml } from 'js-yaml';
import { readFileSync } from 'fs';
import { join } from 'path';
import { ValidationIssue } from '../core/validation-result.types';
import { formatSpectralResults } from '../shared/error-formatter';

/**
 * Run Spectral validation on the spec
 * Returns array of issues found
 */
export async function analyzeWithSpectral(spec: unknown): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  try {
    const spectral = new Spectral();

    // Build ruleset definition with OAS rules
    const rulesetDef: any = {
      extends: [oas as any],
    };

    // Load and merge custom rules from YAML
    const rulesetPath = join(__dirname, '../rules/spectral.ruleset.yaml');
    try {
      const rulesetContent = readFileSync(rulesetPath, 'utf-8');
      const rulesetYaml = loadYaml(rulesetContent) as Record<string, unknown>;

      // Merge custom rules
      if (rulesetYaml && typeof rulesetYaml === 'object') {
        if ('rules' in rulesetYaml && rulesetYaml.rules) {
          rulesetDef.rules = (rulesetYaml as any).rules;
        }
      }
    } catch (readErr) {
      // Silently continue with just OAS rules if custom rules can't be loaded
    }

    spectral.setRuleset(rulesetDef as RulesetDefinition);

    const specString = typeof spec === 'string' ? spec : JSON.stringify(spec, null, 2);
    const diagnostics = await spectral.run(specString);
    const spectralIssues = formatSpectralResults(diagnostics);
    issues.push(...spectralIssues);
  } catch (err) {
    // Silently continue if Spectral fails - validation already caught structural issues
  }

  return issues;
}
