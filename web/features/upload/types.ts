export type ImageKitAuth = {
  signature: string;
  expire: number;
  token: string;
  publicKey: string;
  urlEndpoint: string;
};

export type UploadedImage = {
  fileId: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  height?: number;
  width?: number;
  size?: number;
};

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];
