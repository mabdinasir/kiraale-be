export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
export const allowedVideoTypes = ['video/mp4', 'video/quicktime'];
export const allowedFileTypes = [...allowedImageTypes, ...allowedVideoTypes];

// File size constants (15MB for all uploads)
export const maxFileSize = 1048576 * 15; // 15MB
export const maxFileSizeBytes = maxFileSize;
export const maxFileSizeMB = 15;

// Upload limits
export const maxPropertyMediaFiles = 10;
export const minFirstUploadFiles = 4;
