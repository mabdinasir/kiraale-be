export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
export const allowedVideoTypes = ['video/mp4', 'video/quicktime'];
export const allowedFileTypes = [...allowedImageTypes, ...allowedVideoTypes];

// File size constants (25MB for all uploads)
export const maxFileSize = 1048576 * 25; // 25MB
export const maxFileSizeBytes = maxFileSize;
export const maxFileSizeMB = 25;

// Upload limits
export const maxPropertyMediaFiles = 20;
export const minPropertyMediaFiles = 4;
export const minFirstUploadFiles = 4;
export const maxTenantDocumentFiles = 10;
