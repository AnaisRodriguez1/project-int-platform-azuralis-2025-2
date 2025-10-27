import * as ImageManipulator from "expo-image-manipulator";

/**
 * Opciones de optimización
 */
export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0.0 - 1.0
  format?: "webp" | "jpeg" | "png";
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1024,
  maxHeight: 1024,
  quality: 0.85,
  format: "webp",
};

/**
 * 🔧 Optimiza una imagen en React Native usando expo-image-manipulator
 * @param uri  - URI local (string)
 * @param options - opciones de tamaño/calidad
 * @returns Blob optimizado listo para subir
 */
export async function optimizeImage(
  uri: string,
  options: ImageOptimizationOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    if (typeof uri !== "string") {
      throw new Error("optimizeImage: se esperaba un URI local (string).");
    }

    // Redimensionar y comprimir manteniendo proporción
    const result = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: opts.maxWidth, height: opts.maxHeight } }],
      {
        compress: opts.quality,
        format:
          opts.format === "webp"
            ? ImageManipulator.SaveFormat.WEBP
            : opts.format === "jpeg"
            ? ImageManipulator.SaveFormat.JPEG
            : ImageManipulator.SaveFormat.PNG,
      }
    );

    // Convertir a Blob para subir al backend
    const response = await fetch(result.uri);
    const blob = await response.blob();

    console.log(
      `✅ Imagen optimizada (${opts.format}): ${getReadableFileSize(
        blob.size
      )}`
    );

    return blob;
  } catch (error) {
    console.error("❌ Error optimizando imagen:", error);
    throw error;
  }
}

/**
 * 🧑‍⚕️ Optimiza imagen de perfil (512x512, alta calidad)
 */
export async function optimizeProfilePicture(uri: string): Promise<Blob> {
  return optimizeImage(uri, {
    maxWidth: 512,
    maxHeight: 512,
    quality: 0.9,
    format: "webp",
  });
}

/**
 * 📄 Optimiza documento o imagen médica (1920x1920)
 */
export async function optimizeMedicalDocument(uri: string): Promise<Blob> {
  return optimizeImage(uri, {
    maxWidth: 1920,
    maxHeight: 1920,
    quality: 0.85,
    format: "webp",
  });
}

/**
 * ✅ Verifica que un archivo sea imagen
 */
export function isValidImageFile(type: string): boolean {
  return type.startsWith("image/");
}

/**
 * 📏 Devuelve el tamaño legible del archivo
 */
export function getReadableFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
