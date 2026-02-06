import { useState, useEffect } from "react";
import { FileText, Download, Eye, Upload, Search, Filter, Pill, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface MedicalRecord {
    id: string;
    title: string;
    type: "prescription" | "lab_report" | "discharge_summary" | "other";
    date: string;
    doctor?: string;
    size: string;
}

export const MedicalRecordsTab = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const { t } = useLanguage();
    const { user } = useAuth();
    const [records, setRecords] = useState<MedicalRecord[]>([]);

    useEffect(() => {
        const fetchRecords = async () => {
            if (!user?.id) return;

            const { data, error } = await supabase
                .from('medical_records')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) {
                console.error("Error fetching medical records:", error);
                return;
            }

            if (data) {
                const formattedRecords: MedicalRecord[] = data.map(record => ({
                    id: record.id,
                    title: record.title || "Untitled Record",
                    type: (record.type as any) || "other",
                    date: record.date || new Date(record.created_at).toLocaleDateString(),
                    doctor: record.doctor_name || "Unknown Doctor",
                    size: "1.2 MB" // Placeholder as we don't store size yet
                }));
                setRecords(formattedRecords);
            }
        };

        fetchRecords();

        // Real-time subscription
        const channel = supabase
            .channel('medical-records-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'medical_records',
                    filter: `user_id=eq.${user?.id}`
                },
                () => {
                    fetchRecords();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user?.id]);

    const handleUpload = () => {
        toast.info(t.uploadComingSoon);
    };

    const getIcon = (type: string) => {
        switch (type) {
            case "prescription": return Pill;
            case "lab_report": return FileBarChart;
            default: return FileText;
        }
    };

    const getColor = (type: string) => {
        switch (type) {
            case "prescription": return "text-blue-500 bg-blue-500/10";
            case "lab_report": return "text-purple-500 bg-purple-500/10";
            default: return "text-gray-500 bg-gray-500/10";
        }
    };

    const filteredRecords = records.filter(record =>
        record.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.doctor?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{t.medicalRecords}</h2>
                <Button onClick={handleUpload} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/20 rounded-xl">
                    <Upload className="w-4 h-4 mr-2" />
                    {t.uploadRecord}
                </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-md group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                    <Input
                        placeholder={t.searchRecords}
                        className="pl-10 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 focus:border-teal-500/50 focus:ring-teal-500/20 rounded-xl h-11 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon" className="h-11 w-11 rounded-xl bg-white/50 dark:bg-slate-800/50 border-slate-200/50 backdrop-blur-sm">
                    <Filter className="w-4 h-4 text-slate-500" />
                </Button>
            </div>

            {/* Records List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                        const Icon = getIcon(record.type);
                        // Convert specific tailwind colors to gradients for the icon background
                        const gradient = record.type === "prescription" ? "from-blue-400 to-indigo-500" :
                            record.type === "lab_report" ? "from-purple-400 to-fuchsia-500" :
                                "from-slate-400 to-slate-600";
                        const shadow = record.type === "prescription" ? "shadow-blue-500/30" :
                            record.type === "lab_report" ? "shadow-purple-500/30" :
                                "shadow-slate-500/30";

                        return (
                            <Card key={record.id} className="border-white/20 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group rounded-2xl overflow-hidden">
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg ${shadow} group-hover:scale-110 transition-transform`}>
                                            <Icon className="w-6 h-6 text-white" />
                                        </div>
                                        <Badge variant="secondary" className="capitalize text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                                            {record.type.replace("_", " ")}
                                        </Badge>
                                    </div>

                                    <h3 className="font-bold text-lg truncate mb-1 text-slate-800 dark:text-slate-100" title={record.title}>{record.title}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                        {record.date} • {record.size}
                                    </p>

                                    {record.doctor && (
                                        <div className="text-xs text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg">
                                            <span className="font-semibold text-teal-600 dark:text-teal-400">{t.prescribedBy}</span> {record.doctor}
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-auto pt-4 border-t border-slate-200/50 dark:border-slate-700/50">
                                        <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs font-medium hover:bg-teal-50 dark:hover:bg-teal-900/20 hover:text-teal-600">
                                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                                            {t.view}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 h-9 text-xs font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600">
                                            <Download className="w-3.5 h-3.5 mr-1.5" />
                                            {t.download}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-16 px-4 text-muted-foreground bg-white/40 dark:bg-slate-800/40 backdrop-blur-sm rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-600" />
                        <p className="text-lg font-medium">{t.noRecordsFound}</p>
                        <p className="text-sm opacity-70">Upload documents to keep them safe</p>
                    </div>
                )}
            </div>
        </div>
    );
};
