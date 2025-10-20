// metro.config.ts — configuración compatible con Expo SDK 54 + TypeScript + SVG
import { getDefaultConfig } from "expo/metro-config";
import { ExpoConfig } from "@expo/config-types";

// Obtenemos la configuración base de Expo
const config = getDefaultConfig(__dirname) as ExpoConfig & {
  transformer: any;
  resolver: any;
};

// Asignamos el transformer de SVG
config.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

// Obtenemos las extensiones del resolver
const { assetExts, sourceExts } = config.resolver;

// ✅ Tipamos el parámetro `ext` para evitar el warning ts(7006)
config.resolver.assetExts = assetExts.filter((ext: string) => ext !== "svg");
config.resolver.sourceExts = [...sourceExts, "svg"];

// Exportamos la configuración final
module.exports = config;
