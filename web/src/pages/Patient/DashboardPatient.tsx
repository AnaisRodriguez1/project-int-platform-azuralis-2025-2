import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { BottomNavigation } from "@/components/BottomNavigation";
import { patientTabs } from "@/common/config/navigationTabs";
import { HomePatient } from "./Home";
import { NotesPatient } from "./Notes";
import { DocumentsPatient } from "./Documents";
import { usePatientData } from "@/hooks/usePatientData";
import { ProfilePatient } from "./Profile";

export function DashboardPatient() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('home');
    const { cancerColor } = usePatientData();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const onTabChange = (tabId: string) => {
        setActiveTab(tabId);
    };

    // Función para renderizar el contenido según la tab activa
    const renderContent = () => {
        switch (activeTab) {
            case 'home':
                return(<HomePatient />);
            case 'notes':
                return (<NotesPatient/>);
            case 'documents':
                return (<DocumentsPatient/>);
            case 'profile':
                return (<ProfilePatient/>);
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Mi Ficha Médica
                            </h1>
                            <p className="text-gray-600 mt-2">
                                Bienvenido/a, {user?.name}
                            </p>
                        </div>
                        <Button onClick={handleLogout} variant="outline">
                            Cerrar Sesión
                        </Button>
                    </div>
                    
                    {/* Contenido dinámico según tab activa */}
                    {renderContent()}
                </div>
            </div>

            {/* Bottom Navigation */}
            <BottomNavigation
                activeTab={activeTab}
                onTabChange={onTabChange}
                accentColor={cancerColor.color}
                tabs={patientTabs}
            />
        </div>
    );
}
