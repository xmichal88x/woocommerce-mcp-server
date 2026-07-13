import { registerGroup } from '../groups.js';
import { crudTools } from './products-crud.js';
import { taxonomyTools } from './products-taxonomy.js';
import { miscTools } from './products-misc.js';

registerGroup({
  name: 'products',
  tools: [...crudTools, ...taxonomyTools, ...miscTools],
});
