import { MapPin, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface Hospital {
    id: string;
    name: string;
    location: string;
    specialties: string[];
    doctorsCount: number;
    image?: string;
    rating?: number;
}

interface HospitalCardProps {
    hospital: Hospital;
    onViewDoctors: (hospitalName: string) => void;
}

export const HospitalCard = ({ hospital, onViewDoctors }: HospitalCardProps) => {
    return (
        <Card className="overflow-hidden rounded-2xl hover:shadow-lg transition-all duration-300 group border-border/50">
            <div className="relative h-32 bg-muted">
                {hospital.image ? (
                    <img
                        src={hospital.image}
                        alt={hospital.name}
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="h-full w-full flex items-center justify-center bg-primary/5 text-primary">
                        <MapPin className="h-10 w-10 opacity-50" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge className="bg-white/90 text-black hover:bg-white backdrop-blur-sm shadow-sm">
                        {hospital.rating} ★
                    </Badge>
                </div>
            </div>

            <div className="p-4">
                <h3 className="font-bold text-lg mb-1 truncate">{hospital.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-3.5 w-3.5 mr-1" />
                    {hospital.location}
                </div>

                <div className="flex flex-wrap gap-1 mb-4">
                    {hospital.specialties.slice(0, 3).map((spec, i) => (
                        <Badge key={i} variant="outline" className="text-[10px] px-2 py-0 h-5 bg-background/50">
                            {spec}
                        </Badge>
                    ))}
                    {hospital.specialties.length > 3 && (
                        <Badge variant="outline" className="text-[10px] px-2 py-0 h-5 bg-background/50">
                            +{hospital.specialties.length - 3}
                        </Badge>
                    )}
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="text-xs text-primary font-medium flex items-center">
                        <Users className="h-3.5 w-3.5 mr-1" />
                        {hospital.doctorsCount} Doctors
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDoctors(hospital.name)}
                        className="text-primary hover:text-primary hover:bg-primary/10 p-0 h-auto font-medium"
                    >
                        View Doctors <ArrowRight className="h-3.5 w-3.5 ml-1" />
                    </Button>
                </div>
            </div>
        </Card>
    );
};
