import { startServer } from './server.js';
import { getConfig } from './config.js';
import { safeError } from './errors.js';
import type { Config } from './config.js';
import './tools/products.js';
import './tools/orders.js';
import './tools/shipping.js';
import './tools/taxes.js';
import './tools/coupons.js';
import './tools/customers.js';
import './tools/email.js';
import './tools/reports.js';
import './tools/system.js';

let config: Config;
try {
  config = getConfig();
} catch (error) {
  console.error(safeError(error).message);
  process.exit(1);
}

startServer(config).catch((error) => {
  console.error('Fatal error:', safeError(error).message);
  process.exit(1);
});
