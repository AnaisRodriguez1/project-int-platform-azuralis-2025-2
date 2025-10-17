import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DashboardDoctor } from "../pages/Doctor/DashboardDoctor";
import { DashboardPatient } from "../pages/Patient/DashboardPatient";
import { DashboardGuardian } from "../pages/Guardian/DashboardGuardian";
import { DashboardNurse } from "../pages/Nurse/DashboardNurse";
import { ProtectedRoute } from "../components/ProtectedRoute";
import { HomePage } from "../pages/HomePage";
import { RegisterScreen } from "../pages/RegisterScreen";

export function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Ruta pública - Login (o redirige a dashboard si está autenticado) */}
                <Route path="/" element={<HomePage />} />

                {/* Ruta pública - Registro */}
                <Route path="/register" element={<RegisterScreen />} />

                {/* Rutas protegidas - Dashboards */}
                <Route
                    path="/dashboard-doctor"
                    element={
                        <ProtectedRoute>
                            <DashboardDoctor />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard-patient"
                    element={
                        <ProtectedRoute>
                            <DashboardPatient />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard-guardian"
                    element={
                        <ProtectedRoute>
                            <DashboardGuardian />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/dashboard-nurse"
                    element={
                        <ProtectedRoute>
                            <DashboardNurse />
                        </ProtectedRoute>
                    }
                />

                {/* Ruta 404 - Redirigir al inicio */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
