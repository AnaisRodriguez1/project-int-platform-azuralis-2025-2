import React from "react";

interface CardProps {
    children: React.ReactNode; //Acepta cualquier elemento de React como 'hijo'
    className?:string;
}

const Card : React.FC<CardProps> = ({children, className = ''}) => {

    //Los estilos base que definen como se va a ver la etiqueta
    const baseStyles = 'bg-white rounded-xl shadow-md overflow-hidden';

    return(
        //El exterior de la caja este div
        <div className={`${baseStyles} ${className}`}>
            {/*Padding uniforme*/}
            <div className="p-8">
                {children} {/*Renderiza lo que se le pase dentro*/}
            </div>
        </div>
    );
};

export default Card;