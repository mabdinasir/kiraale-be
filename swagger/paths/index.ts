import { adminPaths } from './admin';
import { agencyPaths } from './agencies';
import { authPaths } from './auth';
import { fileUploadPaths } from './fileUploads';
import { healthPaths } from './health';
import { mediaBasicPaths } from './mediaBasic';
import { mediaDetailsPaths } from './mediaDetails';
import { mediaUploadsPaths } from './mediaUploads';
import { propertyPaths } from './properties';
import { propertySearchPaths } from './propertySearch';
import { userPaths } from './users';

export const paths = {
  ...healthPaths,
  ...authPaths,
  ...userPaths,
  ...adminPaths,
  ...agencyPaths,
  ...propertyPaths,
  ...propertySearchPaths,
  ...mediaBasicPaths,
  ...mediaDetailsPaths,
  ...mediaUploadsPaths,
  ...fileUploadPaths,
};
