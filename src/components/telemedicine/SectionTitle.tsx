import { cn } from "@/lib/utils";

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    className?: string;
}

export const SectionTitle = ({ title, subtitle, className }: SectionTitleProps) => {
    return (
        <div className={cn("mb-6", className)}>
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/70">
                {title}
            </h2>
            {subtitle && (
                <p className="text-muted-foreground mt-1">{subtitle}</p>
            )}
        </div>
    );
};
