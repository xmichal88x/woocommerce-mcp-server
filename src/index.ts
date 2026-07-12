import { startServer } from './server.js';
import { getConfig } from './config.js';
import { safeError } from './errors.js';
import './tools/configurator.js';
import './tools/media.js';
import './tools/orders.js';
import './tools/panel.js';
import './tools/products.js';
import './tools/reports.js';
import './tools/shipping.js';
import './tools/system.js';
import './tools/taxes.js';
import './tools/coupons.js';
import './tools/customers.js';
import './tools/email.js';

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
