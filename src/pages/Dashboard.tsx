import { useState, useEffect } from "react";
import LoadingScreen from "@/components/auralaid/ui/LoadingScreen";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { OverviewTab } from "@/components/dashboard/OverviewTab";
import { AppointmentsTab } from "@/components/dashboard/AppointmentsTab";
import { MedicalRecordsTab } from "@/components/dashboard/MedicalRecordsTab";
import { ProfileTab } from "@/components/dashboard/ProfileTab";

const Dashboard = () => {
    const [activeTab, setActiveTab] = useState("overview");
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (isLoading) {
        return <LoadingScreen />;
    }

    const renderContent = () => {
        switch (activeTab) {
            case "overview":
                return <OverviewTab />;
            case "appointments":
                return <AppointmentsTab />;
            case "records":
                return <MedicalRecordsTab />;
            case "profile":
                return <ProfileTab />;
            default:
                return <OverviewTab />;
        }
    };

    return (
        <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
            {renderContent()}
        </DashboardLayout>
    );
};

export default Dashboard;
