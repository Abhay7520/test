import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export const SearchBar = ({ value, onChange, placeholder = "Search doctors, hospitals, or symptoms..." }: SearchBarProps) => {
    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="pl-10 h-12 rounded-full border-primary/20 focus-visible:ring-primary/30 bg-background/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-300"
                placeholder={placeholder}
            />
        </div>
    );
};
