import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { validateSchema } from '../validators/openapi-schema.validator';

describe('JSON Schema & OpenAPI Validator', () => {
  describe('Valid Spec', () => {
    it('should validate a complete valid OpenAPI spec', async () => {
      const spec = {
        openapi: '3.0.0',
        info: {
          title: 'Pet Store API',
          version: '1.0.0',
          description: 'A valid OpenAPI specification',
        },
        servers: [
          {
            url: 'https://petstore.swagger.io/v2',
          },
        ],
        paths: {
          '/pets': {
            get: {
              summary: 'Get all pets',
              responses: {
                '200': {
                  description: 'A list of pets',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Pet',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Pet: {
              type: 'object',
              required: ['id', 'name'],
              properties: {
                id: {
                  type: 'integer',
                  format: 'int64',
                },
                name: {
                  type: 'string',
                },
                status: {
                  type: 'string',
                  enum: ['available', 'pending', 'sold'],
                },
              },
            },
          },
        },
      };

      const result = await validateSchema(spec);

      expect(result.valid).toBe(true);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('Broken References', () => {
    it('should detect missing schema references', async () => {
      const spec = {
        openapi: '3.0.0',
        info: {
          title: 'Broken References API',
          version: '1.0.0',
        },
        paths: {
          '/users': {
            get: {
              summary: 'Get users',
              responses: {
                '200': {
                  description: 'User list',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/NonExistentSchema',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateSchema(spec);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);
      expect(result.issues[0].severity).toBe('error');
      expect(result.issues[0].source).toBe('swagger-parser');
    });
  });

  describe('Circular References', () => {
    it('should detect circular references in schemas', async () => {
      const spec = {
        openapi: '3.0.0',
        info: {
          title: 'Circular Refs API',
          version: '1.0.0',
        },
        paths: {
          '/pets': {
            get: {
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/Pet',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          schemas: {
            Pet: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                },
                owner: {
                  $ref: '#/components/schemas/Owner',
                },
              },
            },
            Owner: {
              type: 'object',
              properties: {
                id: {
                  type: 'integer',
                },
                pets: {
                  type: 'array',
                  items: {
                    $ref: '#/components/schemas/Pet',
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateSchema(spec);

      expect(result.valid).toBe(false);
      expect(result.issues.length).toBeGreaterThan(0);

      const circularIssue = result.issues.find(i => i.message.includes('Circular'));
      expect(circularIssue).toBeDefined();
      expect(circularIssue?.severity).toBe('error');
      expect(circularIssue?.source).toBe('swagger-parser');
    });
  });

  describe('Input Validation', () => {
    it('should reject non-object input', async () => {
      const result = await validateSchema('not an object');

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
      expect(result.issues[0].message).toContain('must be a valid JSON object');
    });

    it('should reject null input', async () => {
      const result = await validateSchema(null);

      expect(result.valid).toBe(false);
      expect(result.issues).toHaveLength(1);
    });
  });

  describe('Error Formatting', () => {
    it('should return proper error structure', async () => {
      const spec = {
        openapi: '3.0.0',
        info: { title: 'Test', version: '1.0' },
        paths: {
          '/test': {
            get: {
              responses: {
                '200': {
                  description: 'OK',
                  content: {
                    'application/json': {
                      schema: {
                        $ref: '#/components/schemas/Missing',
                      },
                    },
                  },
                },
              },
            },
          },
        },
      };

      const result = await validateSchema(spec);

      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('issues');
      expect(Array.isArray(result.issues)).toBe(true);

      if (result.issues.length > 0) {
        const issue = result.issues[0];
        expect(issue).toHaveProperty('path');
        expect(issue).toHaveProperty('message');
        expect(issue).toHaveProperty('severity');
        expect(issue).toHaveProperty('source');
      }
    });
  });
});
