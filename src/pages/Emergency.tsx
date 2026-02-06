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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col relative overflow-hidden">
      {/* Ambient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-teal-500/5 dark:from-red-500/10 dark:to-teal-500/10 pointer-events-none" />

      {/* Header */}
      <header className="z-10 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-b border-white/20 dark:border-slate-800 py-4 px-6 flex items-center justify-between sticky top-0 shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-500">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">{t.emergency}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Use only in case of emergency</p>
            </div>
          </div>
        </div>
        {emergencyActive && (
          <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-3 py-1.5 rounded-full border border-red-200 dark:border-red-900/50 shadow-sm animate-pulse">
            <div className="h-2 w-2 bg-red-600 dark:bg-red-500 rounded-full" />
            <span className="text-xs font-bold uppercase tracking-wider">{t.active}</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 relative z-0">
        <div className="max-w-5xl mx-auto h-full">
          {emergencyActive ? (
            <div className="h-full flex flex-col justify-center animate-fade-in">
              <AmbulanceTracking
                onBack={() => setEmergencyActive(false)}
                onCancel={() => {
                  setEmergencyActive(false);
                  toast.info(t.emergencyCancelled);
                }}
              />
            </div>
          ) : !activeSection ? (
            <div className="flex flex-col h-full justify-center gap-8 animate-fade-in py-8 md:py-0">

              {/* Hero Section: SOS */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative group cursor-pointer mb-8" onClick={handleCallAmbulance}>
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20 duration-1000" />
                  <div className="absolute inset-[-10px] bg-red-500/20 rounded-full blur-xl group-hover:bg-red-500/40 transition-all duration-300" />

                  {/* Main Button */}
                  <div className="relative h-48 w-48 md:h-64 md:w-64 rounded-full bg-gradient-to-br from-red-500 to-rose-600 shadow-2xl shadow-red-500/40 flex flex-col items-center justify-center border-8 border-white dark:border-slate-900 transform group-hover:scale-105 transition-all duration-300">
                    <Phone className="h-12 w-12 md:h-16 md:w-16 text-white mb-2 animate-bounce-slow" />
                    <span className="text-xl md:text-2xl font-black text-white px-4 text-center leading-none">
                      {t.callAmbulance || "CALL Ambulance"}
                    </span>
                    <span className="text-xs md:text-sm text-white/80 mt-1 font-medium">Tap for Help</span>
                  </div>
                </div>
                <p className="text-center text-slate-500 dark:text-slate-400 max-w-sm animate-slide-up">
                  {t.helpOneTap || "Tap the button above immediately to call 108 and share your location with emergency contacts."}
                </p>
              </div>

              {/* Tools Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                {[
                  { id: "location", icon: MapPin, title: t.shareLocation, desc: t.liveGps, color: "text-sky-500", bg: "bg-sky-500/10", border: "hover:border-sky-500/50" },
                  { id: "contacts", icon: Users, title: t.emergencyContacts, desc: t.notifyContacts, color: "text-amber-500", bg: "bg-amber-500/10", border: "hover:border-amber-500/50" },
                  { id: "firstaid", icon: BookOpen, title: t.firstAidInstructions, desc: t.stepByStep, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "hover:border-emerald-500/50" },
                  { id: "telemedicine", icon: Video, title: t.telemedicineCall, desc: t.talkToDoctor, color: "text-violet-500", bg: "bg-violet-500/10", border: "hover:border-violet-500/50" }
                ].map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={`group relative p-4 md:p-6 rounded-2xl bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 hover:shadow-xl transition-all duration-300 cursor-pointer ${item.border}`}
                  >
                    <div className={`h-12 w-12 rounded-xl ${item.bg} ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-1">{item.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Back Navigation for Sub-sections */}
              <div className="sticky top-0 z-10 py-2 bg-slate-50/90 dark:bg-slate-950/90 backdrop-blur-sm mb-4">
                <Button
                  variant="ghost"
                  onClick={() => setActiveSection(null)}
                  className="gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {t.backToEmergency}
                </Button>
              </div>

              {/* Content Area */}
              <div className="flex-1 animate-fade-in bg-white/50 dark:bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/20 dark:border-slate-700/50 p-6 shadow-lg">
                {activeSection === "location" && <LocationShare />}
                {activeSection === "contacts" && <EmergencyContacts />}
                {activeSection === "firstaid" && <FirstAidGuide />}
                {activeSection === "telemedicine" && <TelemedicineCall />}
              </div>
            </div>
          )}
        </div>
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
