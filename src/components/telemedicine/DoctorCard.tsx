import { Star, Video, Phone, User, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Doctor {
    id: string;
    name: string;
    specialization: string;
    hospital: string;
    experience: string;
    rating: number;
    consultOptions: ("video" | "audio" | "inperson")[];
    image?: string;
    qualification?: string;
    languages?: string;
    timings?: string;
    location?: string;
}

interface DoctorCardProps {
    doctor: Doctor;
    onBook: (doctor: Doctor) => void;
}

export const DoctorCard = ({ doctor, onBook }: DoctorCardProps) => {
    return (
        <Card className="p-4 rounded-2xl hover:shadow-md transition-all duration-300 border-border/50 bg-card/50 backdrop-blur-sm">
            <div className="flex gap-4">
                {/* Doctor Image */}
                <div className="relative h-24 w-24 flex-shrink-0 rounded-xl overflow-hidden bg-muted">
                    {doctor.image ? (
                        <img
                            src={doctor.image}
                            alt={doctor.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <div className="h-full w-full flex items-center justify-center bg-primary/10 text-primary">
                            <User className="h-10 w-10" />
                        </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-[10px] py-0.5 text-center backdrop-blur-sm">
                        {doctor.experience} Exp
                    </div>
                </div>

                {/* Doctor Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="font-bold text-lg leading-tight truncate pr-2">
                                {doctor.name}
                            </h3>
                            <p className="text-sm text-primary font-medium mb-1">
                                {doctor.specialization}
                            </p>
                        </div>
                        <div className="flex items-center bg-yellow-500/10 px-1.5 py-0.5 rounded text-yellow-600 text-xs font-bold">
                            <Star className="h-3 w-3 fill-current mr-1" />
                            {doctor.rating}
                        </div>
                    </div>

                    <div className="flex items-center text-xs text-muted-foreground mb-2">
                        <MapPin className="h-3 w-3 mr-1" />
                        {doctor.hospital}
                    </div>

                    {doctor.qualification && (
                        <p className="text-xs text-muted-foreground truncate mb-2">
                            {doctor.qualification}
                        </p>
                    )}

                    {/* Consultation Options Badges */}
                    <div className="flex gap-1.5 mb-3">
                        {doctor.consultOptions.includes("video") && (
                            <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center rounded-full bg-blue-50 text-blue-600 hover:bg-blue-100">
                                <Video className="h-3 w-3" />
                            </Badge>
                        )}
                        {doctor.consultOptions.includes("audio") && (
                            <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center rounded-full bg-green-50 text-green-600 hover:bg-green-100">
                                <Phone className="h-3 w-3" />
                            </Badge>
                        )}
                        {doctor.consultOptions.includes("inperson") && (
                            <Badge variant="secondary" className="h-6 w-6 p-0 flex items-center justify-center rounded-full bg-purple-50 text-purple-600 hover:bg-purple-100">
                                <User className="h-3 w-3" />
                            </Badge>
                        )}
                    </div>
                </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 pt-3 border-t border-border/50">
                <div className="text-xs text-muted-foreground flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {doctor.timings || "Available Today"}
                </div>
                <Button
                    size="sm"
                    onClick={() => onBook(doctor)}
                    className="rounded-full px-6 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-sm hover:shadow-md transition-all"
                >
                    Book Appointment
                </Button>
            </div>
        </Card>
    );
};
