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

            const { data, error } = await supabase
                .from('medical_records')
                .select('summary_data')
                .eq('user_id', user.id)
                .not('summary_data', 'is', null)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data?.summary_data) {
                setLatestVitals(data.summary_data);
            }
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">{t.goodMorning}, {user?.name?.split(" ")[0] || "Guest"}</h1>
                    <p className="text-muted-foreground mt-1">{t.healthOverview}</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/emergency">
                        <Button variant="destructive" className="shadow-lg shadow-destructive/20">
                            <Phone className="w-4 h-4 mr-2" />
                            {t.emergency}
                        </Button>
                    </Link>
                    <Link to="/telemedicine">
                        <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" />
                            {t.bookAppointment}
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {vitals.map((stat, i) => (
                    <Card key={i} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-full ${stat.bg} flex items-center justify-center`}>
                                <stat.icon className={`w-6 h-6 ${stat.color}`} />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold">{stat.value}</span>
                                    <span className="text-xs text-muted-foreground">{stat.unit}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Next Appointment */}
                <Card className="border-none shadow-md bg-gradient-to-br from-primary/5 to-transparent">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {t.nextAppointment}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {nextAppointment ? (
                            <div className="bg-card rounded-xl p-4 border border-border/50 flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                    {nextAppointment.image ? (
                                        <img src={nextAppointment.image} alt={nextAppointment.doctorName} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-6 h-6 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-lg">{nextAppointment.doctorName}</h3>
                                    <p className="text-primary text-sm font-medium">{nextAppointment.specialty}</p>
                                    <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-4 h-4" /> {nextAppointment.date} at {nextAppointment.time}
                                        </span>
                                        <span className="flex items-center gap-1 capitalize">
                                            <VideoIcon className="w-4 h-4" /> {nextAppointment.type}
                                        </span>
                                    </div>
                                </div>
                                <Button size="sm" className="self-center">{t.join}</Button>
                            </div>
                        ) : (
                            <div className="text-center py-8 text-muted-foreground">
                                <p>{t.noAppointments}</p>
                                <Link to="/telemedicine" className="text-primary hover:underline text-sm mt-2 inline-block">
                                    {t.bookOneNow}
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Recent Activity / Assistant */}
                <Card className="border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-blue-500" />
                            {t.aiAssistant}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="bg-muted/30 rounded-xl p-6 text-center space-y-4">
                            <p className="text-muted-foreground">
                                {latestVitals?.suggestions || "I noticed your heart rate was slightly elevated yesterday. How are you feeling today?"}
                            </p>
                            <Link to="/assistant">
                                <Button variant="outline" className="w-full">
                                    {t.chatWithAssistant}
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

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
