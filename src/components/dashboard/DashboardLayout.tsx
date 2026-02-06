import { useState, ReactNode } from "react";
import {
    LayoutDashboard,
    Calendar,
    FileText,
    User,
    Settings,
    LogOut,
    Menu,
    X,
    Heart,
    ArrowLeft,
    Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/common/LanguageSelector";

interface DashboardLayoutProps {
    children: ReactNode;
    activeTab: string;
    onTabChange: (tab: string) => void;
}

export const DashboardLayout = ({ children, activeTab, onTabChange }: DashboardLayoutProps) => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { logout } = useAuth();

    const navItems = [
        { id: "overview", label: t.overview, icon: LayoutDashboard },
        { id: "appointments", label: t.appointments, icon: Calendar },
        { id: "records", label: t.medicalRecords, icon: FileText },
        { id: "profile", label: t.profile, icon: User },
        // { id: "settings", label: "Settings", icon: Settings },
    ];

    const handleLogout = async () => {
        await logout();
        navigate("/");
    };

    return (
        <div className="min-h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "fixed md:sticky top-0 left-0 z-50 h-screen w-72 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-r border-slate-700/50 transition-transform duration-300 ease-out flex flex-col relative overflow-hidden shadow-2xl",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
                )}
            >
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                <div className="p-6 border-b border-slate-700/50 flex items-center justify-between relative z-10">
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Heart className="w-5 h-5 text-white fill-current" />
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-teal-200 via-cyan-200 to-blue-200 bg-clip-text text-transparent">{t.appName}</span>
                    </Link>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-slate-400 hover:text-white hover:bg-white/10"
                        onClick={() => setIsSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto relative z-10">
                    {navItems.map((item) => {
                        const isActive = activeTab === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    onTabChange(item.id);
                                    setIsSidebarOpen(false);
                                }}
                                className={cn(
                                    "w-full flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden",
                                    isActive
                                        ? "text-white shadow-lg shadow-teal-500/20"
                                        : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-teal-600 to-cyan-600 opacity-100" />
                                )}
                                <item.icon className={cn("w-5 h-5 relative z-10 transition-transform duration-300 group-hover:scale-110", isActive ? "text-white" : "text-slate-500 group-hover:text-teal-400")} />
                                <span className="relative z-10">{item.label}</span>
                            </button>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-slate-700/50 relative z-10 bg-slate-900/50">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-300"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-5 h-5 mr-3" />
                        {t.logout}
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* Header */}
                <header className="h-20 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700/50 flex items-center justify-between px-6 shadow-sm sticky top-0 z-20 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        >
                            <Menu className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent capitalize">
                                {navItems.find((item) => item.id === activeTab)?.label}
                            </h1>
                            <p className="text-xs text-muted-foreground hidden md:block">Welcome to your health dashboard</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <LanguageSelector />
                        <Link to="/">
                            <Button variant="ghost" size="sm" className="hidden md:flex hover:bg-primary/5">
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                {t.backToHome}
                            </Button>
                        </Link>
                        <Button variant="ghost" size="icon" className="relative hover:bg-primary/5 rounded-full w-10 h-10">
                            <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        </Button>
                    </div>
                </header>

                {/* Content Area */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};
