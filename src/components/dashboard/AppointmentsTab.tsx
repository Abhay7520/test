import { useState } from "react";
import { Calendar, Clock, MapPin, Video, Phone, User, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

interface Appointment {
    id: string;
    doctorName: string;
    specialty: string;
    hospital: string;
    date: string;
    time: string;
    type: "video" | "audio" | "in-person";
    status: "upcoming" | "completed" | "cancelled";
    image?: string;
}

export const AppointmentsTab = () => {
    const { appointments } = useAuth();
    const { t } = useLanguage();



    const handleCancel = async (id: string) => {
        try {
            const { error } = await supabase
                .from('appointments')
                .update({ status: 'cancelled' })
                .eq('id', id);

            if (error) throw error;
            toast.success(t.appointmentCancelled);
        } catch (error) {
            console.error("Error cancelling appointment:", error);
            toast.error("Failed to cancel appointment");
        }
    };

    const handleReschedule = (id: string) => {
        toast.info(t.rescheduleComingSoon);
    };

    const AppointmentCard = ({ appointment }: { appointment: Appointment }) => (
        <Card className="mb-4 overflow-hidden border-white/20 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 group">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    {/* Date/Time Column */}
                    <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 md:w-48 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-700/50">
                        <div className="text-xs font-bold uppercase tracking-wider text-teal-600 dark:text-teal-400 mb-1">
                            {appointment.status === "upcoming" ? t.scheduledFor : t.date}
                        </div>
                        <div className="text-2xl font-bold text-slate-800 dark:text-slate-100">{appointment.date}</div>
                        <div className="text-lg text-slate-500 dark:text-slate-400 font-medium">{appointment.time}</div>
                        <Badge variant="outline" className="mt-3 capitalize bg-white/50 dark:bg-slate-800/50 backdrop-blur border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300">
                            {appointment.type}
                        </Badge>
                    </div>

                    {/* Doctor Info */}
                    <div className="p-6 flex-1 flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 p-0.5 shadow-lg group-hover:scale-105 transition-transform duration-300">
                            <div className="w-full h-full rounded-[14px] overflow-hidden bg-white dark:bg-slate-800">
                                {appointment.image ? (
                                    <img src={appointment.image} alt={appointment.doctorName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                                        <User className="w-8 h-8 text-slate-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent truncate">{appointment.doctorName}</h3>
                            <p className="text-teal-600 dark:text-teal-400 font-medium text-sm">{appointment.specialty}</p>
                            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">{appointment.hospital}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-6 flex items-center justify-end gap-3 border-t md:border-t-0 md:border-l border-slate-200/50 dark:border-slate-700/50 bg-slate-50/30 dark:bg-slate-900/30">
                        {appointment.status === "upcoming" && (
                            <>
                                {appointment.type === "video" && (
                                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-500/20 border-0">
                                        <Video className="w-4 h-4 mr-2" />
                                        {t.join}
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="hover:bg-slate-200/50 dark:hover:bg-slate-700/50">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl scroll-smooth">
                                        <DropdownMenuItem onClick={() => handleReschedule(appointment.id)}>
                                            {t.reschedule}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-900/20"
                                            onClick={() => handleCancel(appointment.id)}
                                        >
                                            {t.cancelAppointment}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                        {appointment.status === "completed" && (
                            <Button variant="outline" size="sm" className="border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20">{t.viewSummary}</Button>
                        )}
                        {appointment.status === "cancelled" && (
                            <Badge variant="destructive" className="bg-red-100 text-red-600 hover:bg-red-200 border border-red-200 shadow-none dark:bg-red-900/30 dark:text-red-400 dark:border-red-800">{t.cancelled}</Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const upcoming = appointments.filter(a => a.status === "upcoming");
    const past = appointments.filter(a => a.status !== "upcoming");

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{t.myAppointments}</h2>
                <Button className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/20 rounded-xl">
                    <Calendar className="w-4 h-4 mr-2 text-white" />
                    {t.bookNew}
                </Button>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="bg-white/50 dark:bg-slate-800/50 backdrop-blur p-1 rounded-xl border border-white/20 dark:border-slate-700/50">
                    <TabsTrigger value="upcoming" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all">{t.upcoming} ({upcoming.length})</TabsTrigger>
                    <TabsTrigger value="past" className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-md transition-all">{t.past} ({past.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6 space-y-4">
                    {upcoming.length > 0 ? (
                        upcoming.map(app => <AppointmentCard key={app.id} appointment={app} />)
                    ) : (
                        <div className="text-center py-16 px-4 text-muted-foreground bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                            <p className="text-lg font-medium">{t.noAppointments}</p>
                            <p className="text-sm opacity-70">Schedule a consultation to get started</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past" className="mt-6 space-y-4">
                    {past.length > 0 ? (
                        past.map(app => <AppointmentCard key={app.id} appointment={app} />)
                    ) : (
                        <div className="text-center py-16 px-4 text-muted-foreground bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                            <Clock className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                            <p className="text-lg font-medium">{t.noPastAppointments}</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
