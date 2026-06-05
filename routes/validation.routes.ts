import { Router } from 'express';
import { validateEndpoint, healthEndpoint } from '../controllers/validation.controller';

const router = Router();

/**
 * @swagger
 * /validate:
 *   post:
 *     summary: Validate a JSON Schema or OpenAPI specification
 *     tags:
 *       - Validation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               spec:
 *                 type: object
 *                 description: The OpenAPI or JSON Schema object to validate
 *             required:
 *               - spec
 *     responses:
 *       200:
 *         description: Specification is valid
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 valid:
 *                   type: boolean
 *                 issues:
 *                   type: array
 *       400:
 *         description: Specification has validation issues
 *       422:
 *         description: Invalid request body
 *       500:
 *         description: Internal server error
 */
router.post('/validate', validateEndpoint);

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 */
router.get('/health', healthEndpoint);

export default router;
