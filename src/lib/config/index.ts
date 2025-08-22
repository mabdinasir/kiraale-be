export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
export const allowedVideoTypes = ['video/mp4', 'video/quicktime'];
export const allowedFileTypes = [...allowedImageTypes, ...allowedVideoTypes];

export const maxFileSize = 1048576 * 20; // 20MB

export const mpesaAmount = 1;
export const evcPlusAmount = 1;
