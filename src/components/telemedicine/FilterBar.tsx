import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterBarProps {
    filters: {
        specialization: string;
        type: string;
        hospital: string;
        rating: string;
    };
    onFilterChange: (key: string, value: string) => void;
    onClearFilters: () => void;
    hospitals: string[];
    specializations: string[];
}

export const FilterBar = ({
    filters,
    onFilterChange,
    onClearFilters,
    hospitals,
    specializations,
}: FilterBarProps) => {
    const hasActiveFilters = Object.values(filters).some((v) => v !== "all");

    return (
        <div className="flex flex-wrap gap-3 items-center mb-6 p-1">
            {/* Specialization Filter */}
            <Select
                value={filters.specialization}
                onValueChange={(value) => onFilterChange("specialization", value)}
            >
                <SelectTrigger className="w-[160px] rounded-full bg-background/50 border-primary/20">
                    <SelectValue placeholder="Specialization" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Specialists</SelectItem>
                    {specializations.map((spec) => (
                        <SelectItem key={spec} value={spec}>
                            {spec}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Type Filter */}
            <Select
                value={filters.type}
                onValueChange={(value) => onFilterChange("type", value)}
            >
                <SelectTrigger className="w-[140px] rounded-full bg-background/50 border-primary/20">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="video">Video Call</SelectItem>
                    <SelectItem value="audio">Audio Call</SelectItem>
                    <SelectItem value="inperson">In-Person</SelectItem>
                </SelectContent>
            </Select>

            {/* Hospital Filter */}
            <Select
                value={filters.hospital}
                onValueChange={(value) => onFilterChange("hospital", value)}
            >
                <SelectTrigger className="w-[160px] rounded-full bg-background/50 border-primary/20">
                    <SelectValue placeholder="Hospital" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">All Hospitals</SelectItem>
                    {hospitals.map((hospital) => (
                        <SelectItem key={hospital} value={hospital}>
                            {hospital}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Rating Filter */}
            <Select
                value={filters.rating}
                onValueChange={(value) => onFilterChange("rating", value)}
            >
                <SelectTrigger className="w-[130px] rounded-full bg-background/50 border-primary/20">
                    <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Any Rating</SelectItem>
                    <SelectItem value="4.5">4.5+ Stars</SelectItem>
                    <SelectItem value="4.0">4.0+ Stars</SelectItem>
                    <SelectItem value="3.0">3.0+ Stars</SelectItem>
                </SelectContent>
            </Select>

            {hasActiveFilters && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="text-muted-foreground hover:text-destructive rounded-full"
                >
                    <X className="h-4 w-4 mr-1" />
                    Clear
                </Button>
            )}
        </div>
    );
};
