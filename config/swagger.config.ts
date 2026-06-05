const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'JSON Schema & OpenAPI Validator API',
    description:
      'A validator combining Spectral and swagger-parser to analyze JSON Schema and OpenAPI specifications',
    version: '1.0.0',
    contact: {
      name: 'Antoine Mahassadi',
      email: 'dmantoinepro@gmail.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.example.com',
      description: 'Production server',
    },
  ],
  tags: [
    {
      name: 'Validation',
      description: 'API specification validation endpoints',
    },
    {
      name: 'Health',
      description: 'Health check and status endpoints',
    },
  ],
  components: {
    schemas: {
      ValidationIssue: {
        type: 'object',
        properties: {
          path: {
            type: 'string',
            description: 'JSON Pointer path to the issue location',
            example: '#/components/schemas/User',
          },
          message: {
            type: 'string',
            description: 'Error or warning message',
            example: 'Token "components" does not exist',
          },
          severity: {
            type: 'string',
            enum: ['error', 'warning', 'info'],
            description: 'Issue severity level',
          },
          source: {
            type: 'string',
            enum: ['swagger-parser', 'spectral'],
            description: 'Validator that detected the issue',
          },
        },
        required: ['path', 'message', 'severity', 'source'],
      },
      ValidationResult: {
        type: 'object',
        properties: {
          valid: {
            type: 'boolean',
            description: 'Whether the specification is valid',
          },
          issues: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/ValidationIssue',
            },
            description: 'List of detected issues',
          },
        },
        required: ['valid', 'issues'],
      },
      ValidationRequest: {
        type: 'object',
        properties: {
          spec: {
            type: 'object',
            description: 'The OpenAPI or JSON Schema object to validate',
            example: {
              openapi: '3.0.0',
              info: {
                title: 'Pet Store API',
                version: '1.0.0',
              },
              paths: {
                '/pets': {
                  get: {
                    summary: 'List all pets',
                    responses: {
                      '200': {
                        description: 'A list of pets',
                      },
                    },
                  },
                },
              },
            },
          },
        },
        required: ['spec'],
      },
      HealthResponse: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            example: 'ok',
          },
        },
        required: ['status'],
      },
    },
  },
};

export default swaggerDefinition;
