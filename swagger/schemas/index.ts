import { commonSchemas } from './common';
import { mediaSchemas } from './media';
import { propertySchemas } from './property';
import { userSchemas } from './user';

export const schemas = {
  ...commonSchemas,
  ...userSchemas,
  ...propertySchemas,
  ...mediaSchemas,
};
