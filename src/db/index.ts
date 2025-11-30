import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the connection
const connectionString = process.env.DATABASE_URL!;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Create postgres client
const client = postgres(connectionString, {
  max: parseInt(process.env.DB_MAX_CONNECTIONS || '10'),
  idle_timeout: parseInt(process.env.DB_CONNECTION_TIMEOUT || '10000'),
});

// Create drizzle instance
export const db = drizzle(client, { schema });

// Export types from schema
export * from './schema';
