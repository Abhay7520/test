import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpecializationCardProps {
    name: string;
    icon: LucideIcon;
    isSelected?: boolean;
    onClick: () => void;
}

export const SpecializationCard = ({ name, icon: Icon, isSelected, onClick }: SpecializationCardProps) => {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center justify-center p-4 rounded-2xl min-w-[100px] h-[110px] transition-all duration-300 border",
                isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-lg scale-105"
                    : "bg-card hover:bg-accent/50 border-border hover:border-primary/30 text-card-foreground hover:scale-105"
            )}
        >
            <div className={cn(
                "p-2.5 rounded-full mb-2 transition-colors",
                isSelected ? "bg-white/20" : "bg-primary/10 text-primary"
            )}>
                <Icon className="h-6 w-6" />
            </div>
            <span className="text-xs font-medium text-center line-clamp-2 leading-tight">
                {name}
            </span>
        </button>
    );
};
