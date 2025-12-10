import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface CancelEmergencyProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const CancelEmergency = ({ onConfirm, onCancel }: CancelEmergencyProps) => {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown === 0) {
      onConfirm();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown(countdown - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown, onConfirm]);

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full p-8 text-center space-y-6 animate-in fade-in zoom-in duration-300">
        <div className="flex justify-center">
          <div className="h-20 w-20 rounded-full bg-emergency/10 flex items-center justify-center">
            <AlertTriangle className="h-10 w-10 text-emergency animate-pulse" />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Emergency Alert</h2>
          <p className="text-muted-foreground">
            Emergency services will be contacted in
          </p>
        </div>

        <div className="relative">
          <div className="text-6xl font-bold text-emergency">{countdown}</div>
          <div className="text-sm text-muted-foreground mt-2">seconds</div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onCancel}
            variant="outline"
            size="lg"
            className="w-full"
          >
            Cancel Emergency
          </Button>
          <Button
            onClick={onConfirm}
            className="w-full bg-emergency hover:bg-emergency-hover text-emergency-foreground"
            size="lg"
          >
            Call Now
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Press "Cancel" if this was triggered by mistake
        </p>
      </Card>
    </div>
  );
};

export default CancelEmergency;