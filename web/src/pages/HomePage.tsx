import React from 'react';
import HeroSection from '../components/HeroSection';

const HomePage: React.FC = () => {

    const handleNavigateToRegister = () => {
        alert('Navegando a la página de registro');
    }

    const handleNavigateToLogin = () => {
        alert('Navegando a la página de inicio de sesión');
    }

    return (
        <HeroSection />
    );
};

export default HomePage

