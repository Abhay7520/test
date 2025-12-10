import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Video, Phone, AlertCircle, Clock } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

const TelemedicineCall = () => {
  const { t } = useLanguage();
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "connected">("idle");

  const startCall = (type: "video" | "audio") => {
    setCallStatus("connecting");
    toast.info(`${t.connecting} (${type})...`);

    // Simulate connection
    setTimeout(() => {
      setCallStatus("connected");
      toast.success(t.connectedToDoctor, {
        description: t.doctorOnCall,
      });
    }, 2000);
  };

  const endCall = () => {
    setCallStatus("idle");
    toast.info(t.callEnded || "Call ended"); // Fallback if key missing
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.telemedicineConsultation}</h2>
              <p className="text-sm text-muted-foreground">
                {t.speakWithDoctor}
              </p>
            </div>
          </div>

          {callStatus === "idle" && (
            <>
              {/* Call Options */}
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 text-center space-y-4 cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                  onClick={() => startCall("video")}>
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t.videoCall}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.videoCallDesc}
                    </p>
                  </div>
                </Card>

                <Card className="p-6 text-center space-y-4 cursor-pointer hover:shadow-lg hover:border-primary transition-all"
                  onClick={() => startCall("audio")}>
                  <div className="flex justify-center">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Phone className="h-8 w-8 text-primary" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">{t.audioCall}</h3>
                    <p className="text-sm text-muted-foreground">
                      {t.audioCallDesc}
                    </p>
                  </div>
                </Card>
              </div>

              {/* Info */}
              <Card className="p-4 bg-info-light border-info/20">
                <div className="flex gap-3">
                  <Clock className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-info">{t.available247}:</p>
                    <ul className="text-info/90 space-y-1">
                      <li>• {t.avgWaitTime}</li>
                      <li>• {t.qualifiedDoctors}</li>
                      <li>• {t.freeEmergency}</li>
                    </ul>
                  </div>
                </div>
              </Card>
            </>
          )}

          {callStatus === "connecting" && (
            <div className="py-12 text-center space-y-4">
              <div className="flex justify-center">
                <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                  <Phone className="h-10 w-10 text-primary" />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold">{t.connecting}</h3>
                <p className="text-sm text-muted-foreground">
                  {t.findingDoctor}
                </p>
              </div>
            </div>
          )}

          {callStatus === "connected" && (
            <div className="space-y-4">
              {/* Video/Call Interface */}
              <Card className="aspect-video bg-gradient-to-br from-primary/5 to-primary/10 flex items-center justify-center border-2 border-primary/20">
                <div className="text-center space-y-3">
                  <div className="h-24 w-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <Video className="h-12 w-12 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Dr. Sarah Johnson</h3>
                    <p className="text-sm text-muted-foreground">
                      Emergency Medicine Specialist
                    </p>
                  </div>
                  <div className="flex items-center justify-center gap-2 text-sm text-success">
                    <div className="h-2 w-2 bg-success rounded-full animate-pulse" />
                    {t.callInProgress}
                  </div>
                </div>
              </Card>

              {/* Call Controls */}
              <div className="flex gap-3">
                <Button
                  onClick={endCall}
                  className="flex-1 bg-emergency hover:bg-emergency-hover text-emergency-foreground"
                  size="lg"
                >
                  {t.endCall}
                </Button>
              </div>

              {/* Call Info */}
              <Card className="p-4 bg-success-light border-success/20">
                <p className="text-sm text-success">
                  {t.doctorCanSee}
                </p>
              </Card>
            </div>
          )}
        </div>
      </Card>

      {/* Warning Card */}
      <Card className="p-4 bg-warning-light border-warning/20">
        <div className="flex gap-3">
          <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
          <div className="space-y-1 text-sm">
            <p className="font-medium text-warning">{t.whenToUse}:</p>
            <ul className="text-warning/90 space-y-1">
              <li>• {t.nonLifeThreatening}</li>
              <li>• {t.waitingAmbulance}</li>
              <li>• {t.needGuidance}</li>
              <li>• {t.conscious}</li>
            </ul>
            <p className="text-warning font-medium mt-2">
              {t.severeEmergency}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TelemedicineCall;
