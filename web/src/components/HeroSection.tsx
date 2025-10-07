import React from 'react';
import Button from './Button'; // Importamos nuestro botón mejorado
import heroImage from '../assets/pacient.jpg'; // 1. Descarga y guarda una imagen en src/assets/

const HeroSection: React.FC = () => {
  return (
    // Contenedor principal que ocupa toda la pantalla y usa Flexbox
    <header className="min-h-screen flex items-center bg-white">
      <div className="container mx-auto px-6">
        {/* Contenedor de la fila, se apila en móvil y se pone en fila en pantallas grandes */}
        <div className="flex flex-col lg:flex-row items-center justify-between">

          {/* Columna de Texto (Izquierda) */}
          <div className="lg:w-1/2 text-center lg:text-left mb-10 lg:mb-0">
            <h1 className="text-5xl lg:text-7xl font-extrabold text-blue-600">
              Bienvenido a
            </h1>
            <h1 className="text-5xl lg:text-7xl font-extrabold text-gray-800 mb-6">
              Lacito
            </h1>
            <p className="text-lg text-gray-600 lg:pr-24">
              Página para acceder a la ficha médica de pacientes.
            </p>
            <div className="flex justify-center lg:justify-start gap-4 mt-8">
              <Button size="lg">Get Started</Button>
              <Button size="lg" variant="ghost">Read more</Button>
            </div>
          </div>

          {/* Columna de Imagen (Derecha) - Oculta en móvil */}
          <div className="hidden lg:block lg:w-1/2">
            <div 
              className="h-[600px] rounded-3xl bg-cover bg-center"
              style={{ backgroundImage: `url(${heroImage})` }}
            >
            </div>
          </div>
          
        </div>
      </div>
    </header>
  );
};

export default HeroSection;