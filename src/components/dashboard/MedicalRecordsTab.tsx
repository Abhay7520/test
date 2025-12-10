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
                    title: record.title,
                    type: (record.type as any) || "other",
                    date: record.date,
                    doctor: record.doctor_name || undefined,
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
                <h2 className="text-2xl font-bold">{t.medicalRecords}</h2>
                <Button onClick={handleUpload}>
                    <Upload className="w-4 h-4 mr-2" />
                    {t.uploadRecord}
                </Button>
            </div>

            {/* Search and Filter */}
            <div className="flex gap-3">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder={t.searchRecords}
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Button variant="outline" size="icon">
                    <Filter className="w-4 h-4" />
                </Button>
            </div>

            {/* Records List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => {
                        const Icon = getIcon(record.type);
                        const colorClass = getColor(record.type);

                        return (
                            <Card key={record.id} className="hover:shadow-md transition-all group">
                                <CardContent className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`w-10 h-10 rounded-lg ${colorClass} flex items-center justify-center`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <Badge variant="secondary" className="capitalize text-xs">
                                            {record.type.replace("_", " ")}
                                        </Badge>
                                    </div>

                                    <h3 className="font-semibold truncate mb-1" title={record.title}>{record.title}</h3>
                                    <p className="text-sm text-muted-foreground mb-4">
                                        {record.date} • {record.size}
                                    </p>

                                    {record.doctor && (
                                        <div className="text-xs text-muted-foreground mb-4 flex items-center gap-1">
                                            <span className="font-medium text-foreground">{t.prescribedBy}</span> {record.doctor}
                                        </div>
                                    )}

                                    <div className="flex gap-2 mt-auto pt-4 border-t border-border">
                                        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs">
                                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                                            {t.view}
                                        </Button>
                                        <Button variant="ghost" size="sm" className="flex-1 h-8 text-xs">
                                            <Download className="w-3.5 h-3.5 mr-1.5" />
                                            {t.download}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <div className="col-span-full text-center py-12 text-muted-foreground bg-muted/30 rounded-xl border border-dashed">
                        <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p>{t.noRecordsFound}</p>
                    </div>
                )}
            </div>
        </div>
    );
};
