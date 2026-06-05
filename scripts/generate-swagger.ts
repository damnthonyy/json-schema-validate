import swaggerJsdoc from 'swagger-jsdoc';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import swaggerDefinition from '../config/swagger.config';

const options = {
  definition: swaggerDefinition,
  apis: ['./routes/**/*.ts', './controllers/**/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

// Ensure dist directory exists
const swaggerPath = './dist/swagger.json';
mkdirSync(dirname(swaggerPath), { recursive: true });

writeFileSync(swaggerPath, JSON.stringify(swaggerSpec, null, 2));
console.log('✅ Swagger spec generated at dist/swagger.json');
