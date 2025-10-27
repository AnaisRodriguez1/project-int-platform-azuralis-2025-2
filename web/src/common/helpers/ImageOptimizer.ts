/**
 * ImageOptimizer
 * 
 * Utilidades para optimizar imágenes antes de subirlas:
 * - Redimensionar a un tamaño máximo
 * - Comprimir la calidad
 * - Convertir a formato WebP (más eficiente)
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
  format?: 'webp' | 'jpeg' | 'png';
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.85,
  format: 'webp',
};

/**
 * Optimiza una imagen para web
 * @param file Archivo de imagen original
 * @param options Opciones de optimización
 * @returns Promise con el Blob optimizado
 */
export async function optimizeImage(
  file: File | Blob,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // Crear un elemento de imagen para cargar el archivo
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      try {
        // Liberar el objeto URL
        URL.revokeObjectURL(objectUrl);

        // Calcular dimensiones manteniendo la proporción
        let { width, height } = img;
        const maxWidth = opts.maxWidth!;
        const maxHeight = opts.maxHeight!;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.floor(width * ratio);
          height = Math.floor(height * ratio);
        }

        // Crear canvas para dibujar la imagen redimensionada
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo obtener el contexto del canvas'));
          return;
        }

        // Dibujar la imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a Blob con el formato y calidad especificados
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log(`✅ Imagen optimizada: ${(file.size / 1024).toFixed(2)} KB → ${(blob.size / 1024).toFixed(2)} KB`);
              resolve(blob);
            } else {
              reject(new Error('Error al convertir la imagen a Blob'));
            }
          },
          opts.format === 'webp' ? 'image/webp' : `image/${opts.format}`,
          opts.quality
        );
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Error al cargar la imagen'));
    };

    img.src = objectUrl;
  });
}

/**
 * Optimiza una imagen de perfil de usuario
 * Usa configuración específica para fotos de perfil:
 * - 512x512px máximo
 * - Alta calidad (0.90)
 * - Formato WebP
 */
export async function optimizeProfilePicture(file: File | Blob): Promise<Blob> {
  return optimizeImage(file, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.90,
    format: 'webp',
  });
}

/**
 * Optimiza un documento/imagen médica
 * Usa configuración específica para documentos:
 * - 1920x1920px máximo (para preservar detalles médicos)
 * - Calidad media-alta (0.85)
 * - Formato WebP
 */
export async function optimizeMedicalDocument(file: File | Blob): Promise<Blob> {
  return optimizeImage(file, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    format: 'webp',
  });
}

/**
 * Valida que el archivo sea una imagen
 */
export function isValidImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

/**
 * Obtiene el tamaño del archivo en un formato legible
 */
export function getReadableFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
