# json-schema-validate

[![CI](https://github.com/damnthonyy/json-schema-validate/workflows/CI/badge.svg)](https://github.com/damnthonyy/json-schema-validate/actions?query=workflow%3ACI)
[![npm version](https://img.shields.io/npm/v/json-schema-validate)](https://www.npmjs.com/package/json-schema-validate)
[![npm downloads](https://img.shields.io/npm/dm/json-schema-validate)](https://www.npmjs.com/package/json-schema-validate)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B%2C%2020%2B-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3%2B-blue)](https://www.typescriptlang.org/)

A lightweight OpenAPI and JSON Schema validator that combines **swagger-parser** and **Spectral**.

## Why?

**Problem:** Neither tool alone is complete:
- **swagger-parser** detects circular references but doesn't flag them as violations
- **Spectral** doesn't handle circular references correctly

**Solution:** This package merges both:
1. **swagger-parser** → Structural validation (broken refs, format errors, circular detection)
2. **Spectral** → Quality rules (OAS compliance, custom rules)

## Installation

```bash
npm install json-schema-validate
```

## Usage

```typescript
import { validateSchema } from 'json-schema-validate';

const spec = {
  openapi: '3.0.0',
  info: { title: 'My API', version: '1.0.0' },
  paths: {
    '/users': {
      get: {
        responses: {
          '200': {
            description: 'List of users',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/User' }
              }
            }
          }
        }
      }
    }
  },
  components: {
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'integer' },
          name: { type: 'string' }
        }
      }
    }
  }
};

const result = await validateSchema(spec);

if (result.valid) {
  console.log('✅ Spec is valid');
} else {
  result.issues.forEach(issue => {
    console.log(`[${issue.severity}] ${issue.source}: ${issue.message}`);
    console.log(`  at: ${issue.path}`);
  });
}
```

## Response

```typescript
interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

interface ValidationIssue {
  path: string;                              // JSON Pointer path
  message: string;                           // Error message
  severity: 'error' | 'warning' | 'info';   // Severity level
  source: 'swagger-parser' | 'spectral';    // Which validator found it
}
```

## What Gets Validated

### Structural Issues (swagger-parser)
- ✅ Broken `$ref` references
- ✅ Circular references (Pet → Owner → Pet)
- ✅ Invalid OpenAPI format
- ✅ Missing required fields

### Quality Issues (Spectral)
- ✅ Empty descriptions
- ✅ Missing types in schemas
- ✅ OAS compliance rules
- ✅ Custom rules (extensible)

## Customizing Rules

Edit `rules/spectral.ruleset.yaml`:

```yaml
extends:
  - spectral:oas

rules:
  no-empty-description:
    description: Descriptions must not be empty
    given: "$..description"
    severity: warn
    then:
      function: pattern
      functionOptions:
        match: ".+"
```

## Testing

```bash
npm run test:run
```

## Contributing

Found a bug or want to suggest an improvement? [Open an issue](https://github.com/damnthonyy/json-schema-validate/issues)

## License

MIT