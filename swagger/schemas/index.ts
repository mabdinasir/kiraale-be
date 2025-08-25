import { agencySchemas } from './agency';
import { commonSchemas } from './common';
import { mediaSchemas } from './media';
import { PaymentSchemas } from './payment';
import { PricingSchemas } from './pricing';
import { propertySchemas } from './property';
import { propertyAnalyticsSchemas } from './propertyAnalytics';
import { userSchemas } from './user';

export const schemas = {
  ...commonSchemas,
  ...userSchemas,
  ...agencySchemas,
  ...propertySchemas,
  ...propertyAnalyticsSchemas,
  ...mediaSchemas,
  ...PaymentSchemas,
  ...PricingSchemas,
};
