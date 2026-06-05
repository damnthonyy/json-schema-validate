import express from 'express';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerDefinition from './config/swagger.config';
import validationRoutes from './routes/validation.routes';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Load or generate Swagger spec
let swaggerSpec = swaggerDefinition;
const isProduction = process.env.NODE_ENV === 'production';
const swaggerPath = join(__dirname, './swagger.json');

if (isProduction && existsSync(swaggerPath)) {
  // Production: load pre-generated swagger.json
  try {
    const swaggerJson = readFileSync(swaggerPath, 'utf-8');
    swaggerSpec = JSON.parse(swaggerJson);
    console.log('Loaded generated swagger.json');
  } catch (err) {
    console.warn('Failed to load swagger.json, using built-in config');
  }
} else {
  // Development: generate on-the-fly from JSDoc
  const options = {
    definition: swaggerDefinition,
    apis: ['./routes/**/*.ts', './controllers/**/*.ts'],
  };
  swaggerSpec = swaggerJsdoc(options);
  console.log('Generated Swagger spec from JSDoc comments');
}

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/', validationRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found', message: 'Use /api-docs for API documentation' });
});

app.listen(PORT, () => {
  console.log(`Validation server listening on port ${PORT}`);
  console.log(`API Docs: http://localhost:${PORT}/api-docs`);
  console.log(`Health: http://localhost:${PORT}/health`);
  console.log(`Validate: POST http://localhost:${PORT}/validate`);
});
