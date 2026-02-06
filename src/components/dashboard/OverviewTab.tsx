import { useState, useEffect } from "react";
import {
    Activity,
    Calendar,
    Clock,
    Heart,
    MessageSquare,
    Phone,
    Plus,
    Thermometer
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

export const OverviewTab = () => {
    const { user, appointments } = useAuth();
    const { t } = useLanguage();
    const [latestVitals, setLatestVitals] = useState<any>(null);

    useEffect(() => {
        const fetchLatestVitals = async () => {
            if (!user?.id) return;

            // 1. Fetch Profile Data (Weight/Height)
            const { data: profile } = await supabase
                .from('profiles')
                .select('weight, height')
                .eq('id', user.id)
                .single();

            // 2. Fetch latest records for specific vitals
            // Note: In a real app, you might have a dedicated 'vitals' table. 
            // Here we look for the latest occurrence of each vital in the JSON column.

            const fetchVital = async (key: string) => {
                const { data } = await supabase
                    .from('medical_records')
                    .select('summary_data, created_at')
                    .eq('user_id', user.id)
                    .not(`summary_data->>${key}`, 'is', null)
                    .order('created_at', { ascending: false })
                    .limit(1)
                    .maybeSingle();
                return data?.summary_data?.[key];
            };

            const [heartRate, bloodPressure, temperature] = await Promise.all([
                fetchVital('heartRate'),
                fetchVital('bloodPressure'),
                fetchVital('temperature')
            ]);

            setLatestVitals({
                heartRate: heartRate,
                bloodPressure: bloodPressure,
                temperature: temperature,
                weight: profile?.weight,
                height: profile?.height
            });
        };

        fetchLatestVitals();
    }, [user?.id]);

    // Get next upcoming appointment
    const nextAppointment = appointments
        .filter(a => a.status === "upcoming")
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];

    const vitals = [
        {
            label: t.heartRate,
            value: latestVitals?.heartRate || "72",
            unit: "bpm",
            icon: Heart,
            color: "text-rose-500",
            bg: "bg-rose-500/10"
        },
        {
            label: t.bloodPressure,
            value: latestVitals?.bloodPressure || "120/80",
            unit: "mmHg",
            icon: Activity,
            color: "text-blue-500",
            bg: "bg-blue-500/10"
        },
        {
            label: t.temperature,
            value: latestVitals?.temperature || "98.6",
            unit: "°F",
            icon: Thermometer,
            color: "text-amber-500",
            bg: "bg-amber-500/10"
        },
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-1">
                <div className="space-y-1">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">
                        {t.goodMorning}, {user?.name?.split(" ")[0] || "Guest"}
                    </h1>
                    <p className="text-muted-foreground text-lg">{t.healthOverview}</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/emergency">
                        <Button variant="destructive" className="shadow-lg shadow-red-500/20 hover:shadow-red-500/40 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                            <Phone className="w-4 h-4 mr-2" />
                            {t.emergency}
                        </Button>
                    </Link>
                    <Link to="/telemedicine">
                        <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 border-none shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 rounded-xl transition-all duration-300 transform hover:-translate-y-1">
                            <Plus className="w-4 h-4 mr-2" />
                            {t.bookAppointment}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vitals?.map((stat, i) => (
                    <Card key={i} className="group border-white/20 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md shadow-xl shadow-slate-200/50 dark:shadow-slate-900/50 hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 rounded-2xl overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent dark:from-white/5 pointer-events-none" />
                        <CardContent className="p-6 flex items-center gap-5 relative z-10">
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-transform duration-300",
                                i === 0 ? "bg-gradient-to-br from-rose-400 to-red-600 shadow-rose-500/30" :
                                    i === 1 ? "bg-gradient-to-br from-blue-400 to-indigo-600 shadow-blue-500/30" :
                                        "bg-gradient-to-br from-amber-400 to-orange-600 shadow-amber-500/30"
                            )}>
                                <stat.icon className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                                <div className="flex items-baseline gap-1 mt-1">
                                    <span className="text-3xl font-bold text-slate-800 dark:text-slate-100">{stat.value}</span>
                                    <span className="text-sm font-semibold text-slate-400">{stat.unit}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Next Appointment */}
                <Card className="border-white/20 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-xl hover:shadow-2xl transition-all duration-300 rounded-3xl overflow-hidden">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400">
                                <Calendar className="w-6 h-6" />
                            </div>
                            {t.nextAppointment}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                        {nextAppointment ? (
                            <div className="relative overflow-hidden rounded-2xl p-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500">
                                <div className="bg-white dark:bg-slate-900 rounded-xl p-5 relative overflow-hidden h-full">
                                    <div className="flex items-start gap-4 relative z-10">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner">
                                            {nextAppointment.image ? (
                                                <img src={nextAppointment.image} alt={nextAppointment.doctorName} className="w-full h-full object-cover" />
                                            ) : (
                                                <UserIcon className="w-8 h-8 text-slate-400" />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-slate-800 dark:text-white">{nextAppointment.doctorName}</h3>
                                            <p className="text-teal-600 dark:text-teal-400 font-medium">{nextAppointment.specialty}</p>
                                            <div className="flex flex-wrap gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
                                                <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                    <Clock className="w-4 h-4 text-teal-500" /> {nextAppointment.date} • {nextAppointment.time}
                                                </span>
                                                <span className="flex items-center gap-1.5 capitalize bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                                                    <VideoIcon className="w-4 h-4 text-blue-500" /> {nextAppointment.type}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="lg" className="w-full mt-6 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-500/20 text-white border-0">
                                        {t.join || "Join Now"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10 px-4 rounded-2xl bg-slate-50/50 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-700">
                                <Calendar className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                                <p className="text-slate-500 dark:text-slate-400 font-medium">{t.noAppointments}</p>
                                <Link to="/telemedicine">
                                    <Button variant="link" className="text-teal-600 dark:text-teal-400 mt-2">
                                        {t.bookOneNow} <ArrowRightIcon className="w-4 h-4 ml-1" />
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity / Assistant */}
                <Card className="border-white/20 dark:border-slate-700/50 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 backdrop-blur-xl shadow-xl rounded-3xl overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-3 opacity-20 transform rotate-12">
                        <MessageSquare className="w-32 h-32 text-indigo-500" />
                    </div>
                    <CardHeader className="relative z-10 pb-2">
                        <CardTitle className="flex items-center gap-3 text-xl">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">
                                <MessageSquare className="w-6 h-6" />
                            </div>
                            {t.aiAssistant}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10 p-6 flex flex-col h-[calc(100%-80px)]">
                        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-indigo-100 dark:border-indigo-900/30 flex-1 flex flex-col justify-center text-center space-y-4 mb-6">
                            <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed italic">
                                "{latestVitals?.suggestions || "I noticed your heart rate was slightly elevated yesterday. How are you feeling today?"}"
                            </p>
                        </div>
                        <Link to="/assistant">
                            <Button className="w-full h-12 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 shadow-lg shadow-indigo-500/20 text-white border-0 text-base">
                                {t.chatWithAssistant}
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

// Helper Icon
const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
);

// Helper icons for this file
const UserIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const VideoIcon = ({ className }: { className?: string }) => (
    <svg
        className={className}
        fill="none"
        height="24"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        width="24"
        xmlns="http://www.w3.org/2000/svg"
    >
        <path d="m22 8-6 4 6 4V8Z" />
        <rect height="12" rx="2" ry="2" width="14" x="2" y="6" />
    </svg>
);
