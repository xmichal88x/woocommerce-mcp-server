import { startServer } from './server.js';
import { getConfig } from './config.js';
import { safeError } from './errors.js';
import './tools/products.js';
import './tools/orders.js';
import './tools/customers.js';

try {
  getConfig();
} catch (error) {
  console.error(safeError(error).message);
  process.exit(1);
}

startServer().catch((error) => {
  console.error('Fatal error:', safeError(error).message);
  process.exit(1);
});
