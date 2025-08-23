const computeSHA256 = async (file: Express.Multer.File) => {
  if (!file) {
    throw new Error('File is undefined');
  }

  const buffer = new Uint8Array(file.buffer);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export default computeSHA256;
