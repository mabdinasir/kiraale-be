import type { Request } from 'express';

export interface ViewTrackingRequest extends Request {
  viewTracking?: {
    propertyId: string;
    shouldTrack: boolean;
  };
  sessionID?: string;
}
