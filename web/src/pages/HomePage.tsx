import React from 'react';
import Button from '../components/Button';
import Card from '../components/Card';

const HomePage: React.FC = () => {

    const handleNavigateToRegister = () => {
        alert('Navegando a la página de registro');
    }

    const handleNavigateToLogin = () => {
        alert('Navegando a la página de inicio de sesión');
    }

    return (
        //Contenedor principal de la página, ocupa toda la pantalla
        <div className="bg-gray-100 min-h-screen flex items-center justify-center">
            <Card className="text-center max-w-md">
                <h1>
                    Bienvenido/a
                </h1>
                {/*Parrafo */}
                <p>
                    Puede unirse a la comunidad o iniciar sesión para continuar
                </p>
                {/*Contenedor para los botones, los alinea y les da espacio*/}
                <div className='flex justify-center gap-4'>
                    <Button onClick={handleNavigateToRegister}>
                        Crear Cuenta
                    </Button>

                    <Button onClick={handleNavigateToLogin}>
                        Iniciar Sesión
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default HomePage

