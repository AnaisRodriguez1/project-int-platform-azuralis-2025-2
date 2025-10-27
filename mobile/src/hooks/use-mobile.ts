import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

/**
 * Hook para detectar si la app se está mostrando en un dispositivo móvil (pantalla pequeña)
 * En Expo/React Native, usa Dimensions en lugar de window.innerWidth
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(false);

  useEffect(() => {
    const checkDevice = () => {
      const { width } = Dimensions.get("window");
      setIsMobile(width < 768); // puedes ajustar el breakpoint según tu diseño
    };

    checkDevice();

    // Suscribirse a los cambios de tamaño de pantalla
    const subscription = Dimensions.addEventListener("change", checkDevice);

    return () => {
      // Quitar el listener al desmontar
      subscription.remove();
    };
  }, []);

  return isMobile;
}
