import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Video, Phone, User, Calendar as CalendarIcon } from "lucide-react";
import { Doctor } from "./DoctorCard";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { format } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useAuth } from "@/contexts/AuthContext";

interface AppointmentModalProps {
    doctor: Doctor | null;
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
}

export const AppointmentModal = ({ doctor, isOpen, onClose, onConfirm }: AppointmentModalProps) => {
    const { addAppointment } = useAuth();
    const [selectedType, setSelectedType] = useState<"video" | "audio" | "inperson">("video");
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [selectedTime, setSelectedTime] = useState<string>("");
    const [reason, setReason] = useState<string>("");

    if (!doctor) return null;

    // Mock time slots
    const timeSlots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM",
        "02:00 PM", "02:30 PM", "03:00 PM", "04:00 PM"
    ];

    const handleConfirm = () => {
        if (!date) {
            toast.error("Please select a date");
            return;
        }
        if (!selectedTime) {
            toast.error("Please select a time slot");
            return;
        }
        if (!reason.trim()) {
            toast.error("Please enter a reason for the appointment");
            return;
        }

        // Add to global context
        addAppointment({
            id: Date.now().toString(),
            doctorName: doctor.name,
            specialty: doctor.specialization,
            hospital: doctor.hospital,
            date: format(date, "PPP"),
            time: selectedTime,
            type: selectedType === "inperson" ? "in-person" : selectedType,
            status: "upcoming",
            image: doctor.image
        });

        onConfirm();
        toast.success("Appointment Booked Successfully!", {
            description: `Your appointment with ${doctor.name} on ${format(date, "PPP")} at ${selectedTime} is confirmed.`
        });
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden bg-card max-h-[90vh] overflow-y-auto">
                <div className="bg-primary/5 p-6 pb-4">
                    <DialogHeader>
                        <DialogTitle className="text-xl">Book Appointment</DialogTitle>
                    </DialogHeader>

                    <div className="flex items-center gap-4 mt-4">
                        <div className="h-16 w-16 rounded-full overflow-hidden bg-background border-2 border-background shadow-sm">
                            {doctor.image ? (
                                <img src={doctor.image} alt={doctor.name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground">
                                    <User className="h-8 w-8" />
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="font-bold text-lg">{doctor.name}</h3>
                            <p className="text-sm text-muted-foreground">{doctor.specialization}</p>
                            <p className="text-xs text-primary font-medium mt-0.5">{doctor.hospital}</p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Consultation Type */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">Consultation Type</label>
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { id: "video", icon: Video, label: "Video" },
                                { id: "audio", icon: Phone, label: "Audio" },
                                { id: "inperson", icon: User, label: "In-Person" },
                            ].map((type) => (
                                <button
                                    key={type.id}
                                    onClick={() => setSelectedType(type.id as any)}
                                    disabled={!doctor.consultOptions.includes(type.id as any)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-xl border transition-all",
                                        selectedType === type.id
                                            ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                                            : "border-border hover:bg-accent/50 text-muted-foreground",
                                        !doctor.consultOptions.includes(type.id as any) && "opacity-50 cursor-not-allowed"
                                    )}
                                >
                                    <type.icon className="h-5 w-5 mb-1.5" />
                                    <span className="text-xs font-medium">{type.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Date Selection with Calendar */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4" /> Select Date
                        </label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal",
                                        !date && "text-muted-foreground"
                                    )}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={date}
                                    onSelect={setDate}
                                    initialFocus
                                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    {/* Time Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                            <Clock className="h-4 w-4" /> Select Time
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                            {timeSlots.map((time) => (
                                <button
                                    key={time}
                                    onClick={() => setSelectedTime(time)}
                                    className={cn(
                                        "px-2 py-2 rounded-lg text-xs font-medium border transition-all",
                                        selectedTime === time
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-background border-border hover:border-primary/50"
                                    )}
                                >
                                    {time}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Reason for Appointment */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-muted-foreground">Reason for Appointment</label>
                        <Textarea
                            placeholder="Briefly describe your symptoms or reason for visit..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            className="resize-none min-h-[80px]"
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2">
                    <Button onClick={handleConfirm} className="w-full h-12 text-base rounded-xl shadow-lg bg-gradient-to-r from-primary to-primary/90 hover:from-primary/95 hover:to-primary">
                        Confirm Booking
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
