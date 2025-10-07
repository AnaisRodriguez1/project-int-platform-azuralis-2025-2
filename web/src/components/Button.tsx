import React from "react";

//Esto es para definir los tipos de variables y tamaños
//Evitamos errores de tipeo, o es primary o es secundary
type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = 'sm' | 'md' | 'lg';

//Definimos las props que va a recibir el boton
// el extends significa que va a heredar todas las p[ropiedades de un botón normal como
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode; // Es lo que va dentro del botón ( texto, íconos)
    variant?: ButtonVariant; // La variante para las clases extra desde afuera para personalizar aún más
    size?: ButtonSize; // El tamaño del botón (opcional?)
}

//Entonces aquí vamos a crear nuestro componente funcional.
//Vamos a desestructurar los props para poder utilizarlos bien y kle vamos a dar valores por defecto
//'className' = ''' permite pasar clases extra desde afuera para personalizar aún más.
//'...props' Agrupamos el resto de las propiedades como onClick para pasarlos al botón real
const Button : React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    ...props
}) => {

    //Definimos clas clases de Tailwind que TODOS los botones tendrán, sin importar su variante o tamaño
    const baseStyles = 'font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-transform transform hover:scale-105';

    //Un objeto que va a mapear cada 'variant' a su clase de Tailwind correspondiente
    const variantStyles = {
        primary : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
        secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
        ghost: 'bg-transparent text-blue-600 hover:bg-blue-100 focus:ring-blue-500',
    };

    const sizeStyles = {
    sm: 'py-1 px-2 text-sm',
    md: 'py-2 px-4 text-base',
    lg: 'py-3 px-6 text-lg',        
    };

    //Unimos todas las cadenas de texto de las clases en una sola
    //Seleccionamos el estilo correcto de las 2 variables basado en los props
    const combinedClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${props.className ?? ''}`;

    return (
        <button className={combinedClasses} {...props}>
            {children}
        </button>
    );
};

export default Button;