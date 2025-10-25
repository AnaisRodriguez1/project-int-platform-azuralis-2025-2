import { config } from "dotenv";
import fs from "fs";

// 🧩 Detectar entorno: "mobile" o "web"
// Si no defines nada, se asume "mobile" por defecto
const envFile = process.env.EXPO_ENV === "web" ? ".env.web" : ".env.mobile";

// ✅ Cargar el archivo .env correspondiente
if (fs.existsSync(envFile)) {
  console.log(`📦 Cargando variables desde: ${envFile}`);
  config({ path: envFile });
} else {
  console.warn(`⚠️ No se encontró ${envFile}, usando valores por defecto.`);
}

// ✅ Exportar la configuración para Expo
export default {
  expo: {
    name: "FamedMobile",
    slug: "famed-mobile",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    scheme: "famedmobile",
    userInterfaceStyle: "light",
    extra: {
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      env: process.env.EXPO_PUBLIC_ENV,
    },
    plugins: [],
  },
};
