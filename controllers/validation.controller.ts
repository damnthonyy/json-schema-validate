import { Request, Response } from 'express';
import { validateSchema } from '../validators/openapi-schema.validator';

/**
 * POST /validate
 * @summary Validate a JSON Schema or OpenAPI specification
 * @tags Validation
 * @requestBody
 *   required: true
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         properties:
 *           spec:
 *             type: object
 *             description: The OpenAPI or JSON Schema object to validate
 *             example:
 *               openapi: "3.0.0"
 *               info:
 *                 title: "Pet Store API"
 *                 version: "1.0.0"
 *               paths:
 *                 /pets:
 *                   get:
 *                     summary: "List all pets"
 *                     responses:
 *                       "200":
 *                         description: "A list of pets"
 *         required:
 *           - spec
 * @responses
 *   200:
 *     description: Specification is valid
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             valid:
 *               type: boolean
 *               example: true
 *             issues:
 *               type: array
 *               example: []
 *   400:
 *     description: Specification has validation issues
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             valid:
 *               type: boolean
 *               example: false
 *             issues:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   path:
 *                     type: string
 *                     example: "#/components/schemas/User"
 *                   message:
 *                     type: string
 *                     example: "Token 'components' does not exist"
 *                   severity:
 *                     type: string
 *                     enum: [error, warning, info]
 *                   source:
 *                     type: string
 *                     enum: [swagger-parser, spectral]
 *   422:
 *     description: Invalid request body
 */
export async function validateEndpoint(req: Request, res: Response) {
  try {
    const { spec } = req.body;

    if (!spec) {
      return res.status(422).json({
        valid: false,
        issues: [
          {
            path: '#/',
            message: 'Request body must contain a "spec" field',
            severity: 'error',
            source: 'swagger-parser',
          },
        ],
      });
    }

    const result = await validateSchema(spec);
    const statusCode = result.valid ? 200 : 400;
    return res.status(statusCode).json(result);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error('Validation error:', errorMsg);
    return res.status(500).json({
      valid: false,
      issues: [
        {
          path: '#/',
          message: `Internal server error: ${errorMsg}`,
          severity: 'error',
          source: 'swagger-parser',
        },
      ],
    });
  }
}

/**
 * GET /health
 * @summary Health check endpoint
 * @tags Health
 * @responses
 *   200:
 *     description: Server is healthy
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           properties:
 *             status:
 *               type: string
 *               example: "ok"
 */
export function healthEndpoint(_req: Request, res: Response) {
  res.status(200).json({ status: 'ok' });
}
