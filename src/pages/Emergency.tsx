import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AlertCircle, Phone, MapPin, Users, BookOpen, Video, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import LocationShare from "@/components/emergency/LocationShare.tsx";
import EmergencyContacts from "@/components/emergency/EmergencyContacts.tsx";
import FirstAidGuide from "@/components/emergency/FirstAidGuide.tsx";
import TelemedicineCall from "@/components/emergency/TelemedicineCall.tsx";
import CancelEmergency from "@/components/emergency/CancelEmergency.tsx";
import AmbulanceTracking from "@/components/emergency/AmbulanceTracking.tsx";
import { useLanguage } from "@/contexts/LanguageContext";

const Emergency = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [emergencyActive, setEmergencyActive] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const handleCallAmbulance = () => {
    setShowCancelDialog(true);
  };

  const confirmEmergency = () => {
    setShowCancelDialog(false);
    setEmergencyActive(true);

    // Simulate ambulance call
    toast.success(t.connectingEmergency, {
      description: t.locationSharedAuto,
    });

    // Auto-dial (in real app, this would use tel: protocol)
    setTimeout(() => {
      window.location.href = "tel:108";
    }, 1000);

    // Auto-trigger location share and contact notifications
    setTimeout(() => {
      toast.success(t.emergencyContactsNotified, {
        description: t.locationSharedContacts,
      });
    }, 2000);

    setTimeout(() => {
      toast.info(t.ambulanceDispatched, {
        description: t.ambulanceETA,
      });
    }, 3000);
  };

  const cancelEmergency = () => {
    setShowCancelDialog(false);
    toast.info(t.emergencyCancelled);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emergency-light via-background to-warning-light">
      {/* Header */}
      <header className="bg-emergency text-emergency-foreground py-4 px-4 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/")}
              className="text-emergency-foreground hover:bg-emergency-foreground/20 mr-1"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <AlertCircle className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">{t.emergency}</h1>
              <p className="text-sm opacity-90">{t.helpOneTap}</p>
            </div>
          </div>
          {emergencyActive && (
            <div className="flex items-center gap-2 bg-emergency-foreground/20 px-3 py-1 rounded-full">
              <div className="h-2 w-2 bg-emergency-foreground rounded-full animate-pulse" />
              <span className="text-sm font-medium">{t.active}</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto p-4 py-8">
        {emergencyActive ? (
          <AmbulanceTracking
            onBack={() => setEmergencyActive(false)}
            onCancel={() => {
              setEmergencyActive(false);
              toast.info(t.emergencyCancelled);
            }}
          />
        ) : !activeSection ? (
          <div className="space-y-6 animate-fade-in">
            {/* Emergency Call Button - Most Prominent */}
            <Card className="p-6 bg-gradient-to-r from-emergency to-emergency-hover border-emergency shadow-emergency hover:scale-[1.02] transition-transform animate-slide-up">
              <button
                onClick={handleCallAmbulance}
                className="w-full text-left"
              >
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-emergency-foreground/20 flex items-center justify-center">
                    <Phone className="h-8 w-8 text-emergency-foreground" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-emergency-foreground mb-1">
                      {t.callAmbulance}
                    </h2>
                    <p className="text-emergency-foreground/90">
                      {t.oneTapCall}
                    </p>
                  </div>
                  <div className="text-emergency-foreground">→</div>
                </div>
              </button>
            </Card>

            {/* Other Emergency Options */}
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-emergency animate-slide-up" style={{ animationDelay: "0.1s" }}
                onClick={() => setActiveSection("location")}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-info-light flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-info" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t.shareLocation}</h3>
                    <p className="text-sm text-muted-foreground">{t.liveGps}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-warning animate-slide-up" style={{ animationDelay: "0.2s" }}
                onClick={() => setActiveSection("contacts")}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-warning-light flex items-center justify-center">
                    <Users className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t.emergencyContacts}</h3>
                    <p className="text-sm text-muted-foreground">{t.notifyContacts}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-success animate-slide-up" style={{ animationDelay: "0.3s" }}
                onClick={() => setActiveSection("firstaid")}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-success-light flex items-center justify-center">
                    <BookOpen className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t.firstAidInstructions}</h3>
                    <p className="text-sm text-muted-foreground">{t.stepByStep}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-all cursor-pointer hover:border-primary animate-slide-up" style={{ animationDelay: "0.4s" }}
                onClick={() => setActiveSection("telemedicine")}>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Video className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t.telemedicineCall}</h3>
                    <p className="text-sm text-muted-foreground">{t.talkToDoctor}</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Emergency Info */}
            <Card className="p-6 bg-info-light border-info/20 animate-slide-up" style={{ animationDelay: "0.5s" }}>
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-medium text-info">{t.emergencyTips}</p>
                  <ul className="text-sm text-info/90 space-y-1 list-disc list-inside">
                    <li>{t.stayCalm}</li>
                    <li>{t.locationAutoShared}</li>
                    <li>{t.contactsNotified}</li>
                    <li>{t.helpOnWay}</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <Button
              variant="outline"
              onClick={() => setActiveSection(null)}
              className="mb-4"
            >
              <X className="h-4 w-4 mr-2" />
              {t.backToEmergency}
            </Button>

            {activeSection === "location" && <LocationShare />}
            {activeSection === "contacts" && <EmergencyContacts />}
            {activeSection === "firstaid" && <FirstAidGuide />}
            {activeSection === "telemedicine" && <TelemedicineCall />}
          </div>
        )}
      </main>

      {/* Cancel Emergency Dialog */}
      {showCancelDialog && (
        <CancelEmergency
          onConfirm={confirmEmergency}
          onCancel={cancelEmergency}
        />
      )}
    </div>
  );
};

export default Emergency;
