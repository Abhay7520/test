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
        <Card className="mb-4 overflow-hidden border-l-4 border-l-primary hover:shadow-md transition-shadow">
            <CardContent className="p-0">
                <div className="flex flex-col md:flex-row">
                    {/* Date/Time Column */}
                    <div className="bg-muted/30 p-4 md:w-48 flex flex-col justify-center items-center md:items-start border-b md:border-b-0 md:border-r border-border">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                            {appointment.status === "upcoming" ? t.scheduledFor : t.date}
                        </div>
                        <div className="text-xl font-bold text-foreground">{appointment.date}</div>
                        <div className="text-lg text-primary font-medium">{appointment.time}</div>
                        <Badge variant="outline" className="mt-2 capitalize bg-background">
                            {appointment.type}
                        </Badge>
                    </div>

                    {/* Doctor Info */}
                    <div className="p-4 flex-1 flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex-shrink-0 overflow-hidden">
                            {appointment.image ? (
                                <img src={appointment.image} alt={appointment.doctorName} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary">
                                    <User className="w-8 h-8" />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold truncate">{appointment.doctorName}</h3>
                            <p className="text-primary font-medium text-sm">{appointment.specialty}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <MapPin className="w-3.5 h-3.5" />
                                <span className="truncate">{appointment.hospital}</span>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 flex items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-border bg-muted/10">
                        {appointment.status === "upcoming" && (
                            <>
                                {appointment.type === "video" && (
                                    <Button size="sm" className="bg-video hover:bg-video/90">
                                        <Video className="w-4 h-4 mr-2" />
                                        {t.join}
                                    </Button>
                                )}
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleReschedule(appointment.id)}>
                                            {t.reschedule}
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => handleCancel(appointment.id)}
                                        >
                                            {t.cancelAppointment}
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}
                        {appointment.status === "completed" && (
                            <Button variant="outline" size="sm">{t.viewSummary}</Button>
                        )}
                        {appointment.status === "cancelled" && (
                            <Badge variant="destructive">{t.cancelled}</Badge>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    const upcoming = appointments.filter(a => a.status === "upcoming");
    const past = appointments.filter(a => a.status !== "upcoming");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">{t.myAppointments}</h2>
                <Button>
                    <Calendar className="w-4 h-4 mr-2" />
                    {t.bookNew}
                </Button>
            </div>

            <Tabs defaultValue="upcoming" className="w-full">
                <TabsList className="grid w-full max-w-[400px] grid-cols-2">
                    <TabsTrigger value="upcoming">{t.upcoming} ({upcoming.length})</TabsTrigger>
                    <TabsTrigger value="past">{t.past} ({past.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="upcoming" className="mt-6 space-y-4">
                    {upcoming.length > 0 ? (
                        upcoming.map(app => <AppointmentCard key={app.id} appointment={app} />)
                    ) : (
                        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t.noAppointments}</p>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="past" className="mt-6 space-y-4">
                    {past.length > 0 ? (
                        past.map(app => <AppointmentCard key={app.id} appointment={app} />)
                    ) : (
                        <div className="text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-20" />
                            <p>{t.noPastAppointments}</p>
                        </div>
                    )}
                </TabsContent>
            </Tabs>
        </div>
    );
};
