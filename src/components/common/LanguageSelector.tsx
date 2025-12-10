
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export const LanguageSelector = () => {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border border-teal-200/50 dark:border-teal-700/50 rounded-2xl px-4 py-2.5 shadow-2xl hover:shadow-teal-500/20 transition-all duration-300 hover:scale-105">
            <Languages className="w-4 h-4 text-teal-600 animate-pulse" />
            <Select value={language} onValueChange={(value: any) => setLanguage(value)}>
                <SelectTrigger className="w-[140px] border-0 bg-transparent focus:ring-0 font-medium">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                    <SelectItem value="en" className="rounded-lg">English</SelectItem>
                    <SelectItem value="hi" className="rounded-lg">हिंदी</SelectItem>
                    <SelectItem value="te" className="rounded-lg">తెలుగు</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};
