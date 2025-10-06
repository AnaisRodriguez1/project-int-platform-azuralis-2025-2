import React from "react";

interface InputProps extends React.ComponentProps<'input'> {
    label: string; // Añadimos esa propiedad que es obligatoria
    id: string;
}

const Input : React.FC<InputProps> = ({label, id, className = '', ...props}) => {
    //Clases de Tailwind que todos los inputs de nuestro sitio tendrán
    const baseStyles ='w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors';

    return (
        <div  className="w-full">
            <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
                {label}
            </label>
            {/*El elemento INPUT real*/}
            <input
                id = {id}
                className = {`${baseStyles} ${className}`}
                {...props}
                />
        </div>
    );
};
export default Input;