import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import Features from "./pages/Features";
import Assistant from "./pages/Assistant";

import Telemedicine from "./pages/Telemedicine";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import 'leaflet/dist/leaflet.css';
import EmergencyPage from "./pages/Emergency";
import HospitalsPage from "./pages/auralaid/HospitalsPage";
import HospitalDetailPage from "./pages/auralaid/HospitalDetailPage";
import AppointmentBookingPage from "./pages/auralaid/AppointmentBookingPage";
import PaymentPage from "./pages/auralaid/PaymentPage";

import { AuthProvider } from "@/contexts/AuthContext";
import Login from "./pages/Login";

import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
    <QueryClientProvider client={queryClient}>
        <AuthProvider>
            <LanguageProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/features" element={<Features />} />
                            <Route path="/assistant" element={<Assistant />} />

                            <Route
                                path="/telemedicine"
                                element={
                                    <ProtectedRoute>
                                        <HospitalsPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/emergency" element={<EmergencyPage />} />
                            <Route path="/hospitals" element={<HospitalsPage />} />
                            <Route path="/hospitals/:id" element={<HospitalDetailPage />} />
                            <Route
                                path="/appointment/:hospitalId"
                                element={
                                    <ProtectedRoute>
                                        <AppointmentBookingPage />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/payment"
                                element={
                                    <ProtectedRoute>
                                        <PaymentPage />
                                    </ProtectedRoute>
                                }
                            />
                            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                            <Route path="*" element={<NotFound />} />
                        </Routes>
                    </BrowserRouter>
                </TooltipProvider>
            </LanguageProvider>
        </AuthProvider>
    </QueryClientProvider>
);

export default App;
