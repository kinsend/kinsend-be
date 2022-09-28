import { IllegalStateException } from './exceptions/IllegalStateException';

export function isImageBase64(imageUrl: string): boolean {
  const result = imageUrl.match(/(data:image\/([^"]+);base64[^"]+)/);
  return !!(result && result[2]);
}

export function extractExtensionFromImageBase64(imageUrl: string): string {
  const result = imageUrl.match(/(data:image\/([^"]+);base64[^"]+)/);
  if (!result || !result[2]) {
    throw new IllegalStateException('Expect base64 image to extract');
  }
  return result[2];
}

export function convertFileToBase64(file: Express.Multer.File): string {
  return file.buffer.toString('base64');
}
