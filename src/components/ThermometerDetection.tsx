import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageUtils";

interface ThermometerDetectionProps {
  onTemperatureDetected: (temp: string) => void;
  language: string;
}

type Language = 'en' | 'hi' | 'te';

const thermometerTranslations = {
  en: {
    title: "📸 AI Thermometer Reading",
    description: "Take a photo or upload an image of your thermometer for instant reading",
    detected: "Detected Temperature:",
    confirm: "✅ Correct, Use This",
    retry: "❌ Try Again",
    takePhoto: "Take Photo",
    uploadImage: "Upload Image",
    processing: "Processing...",
    successTitle: "✅ Temperature Detected!",
    successDesc: "Reading:",
    errorTitle: "Error",
    errorDesc: "Could not read thermometer. Please ensure the image is clear."
  },
  hi: {
    title: "📸 एआई थर्मामीटर रीडिंग",
    description: "तुरंत रीडिंग के लिए अपने थर्मामीटर की फोटो लें या छवि अपलोड करें",
    detected: "पता लगाया गया तापमान:",
    confirm: "✅ सही है, इसे उपयोग करें",
    retry: "❌ फिर से कोशिश करें",
    takePhoto: "फोटो लें",
    uploadImage: "छवि अपलोड करें",
    processing: "प्रसंस्करण...",
    successTitle: "✅ तापमान पता चला!",
    successDesc: "रीडिंग:",
    errorTitle: "त्रुटि",
    errorDesc: "थर्मामीटर नहीं पढ़ सका। कृपया सुनिश्चित करें कि छवि स्पष्ट है।"
  },
  te: {
    title: "📸 AI థర్మామీటర్ రీడింగ్",
    description: "తక్షణ రీడింగ్ కోసం మీ థర్మామీటర్ ఫోటో తీయండి లేదా చిత్రాన్ని అప్‌లోడ్ చేయండి",
    detected: "గుర్తించబడిన ఉష్ణోగ్రత:",
    confirm: "✅ సరైనది, దీన్ని ఉపయోగించండి",
    retry: "❌ మళ్లీ ప్రయత్నించండి",
    takePhoto: "ఫోటో తీయండి",
    uploadImage: "చిత్రాన్ని అప్‌లోడ్ చేయండి",
    processing: "ప్రాసెస్ అవుతోంది...",
    successTitle: "✅ ఉష్ణోగ్రత గుర్తించబడింది!",
    successDesc: "రీడింగ్:",
    errorTitle: "లోపం",
    errorDesc: "థర్మామీటర్ చదవలేకపోయింది. దయచేసి చిత్రం స్పష్టంగా ఉందని నిర్ధారించుకోండి."
  }
};

const ThermometerDetection = ({ onTemperatureDetected, language }: ThermometerDetectionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedTemp, setDetectedTemp] = useState<string | null>(null);
  const { toast } = useToast();
  const t = thermometerTranslations[language as Language] || thermometerTranslations.en;

  const processImage = async (file: File) => {
    setIsProcessing(true);
    try {
      const base64Image = await compressImage(file);

      // Call edge function to detect temperature using AI vision
      const { data, error } = await supabase.functions.invoke('detect-temperature', {
        body: { image: base64Image, language }
      });

      if (error) {
        console.error("Supabase Function Error:", error);
        throw error;
      }

      if (data?.temperature) {
        setDetectedTemp(data.temperature);
        toast({
          title: t.successTitle,
          description: `${t.successDesc} ${data.temperature}`,
        });
      } else {
        throw new Error("Could not read thermometer");
      }
    } catch (error) {
      console.error("Error processing image:", error);
      toast({
        title: t.errorTitle,
        description: error instanceof Error ? error.message : t.errorDesc,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleCameraCapture = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        processImage(file);
      }
    };
    input.click();
  };

  const confirmTemperature = () => {
    if (detectedTemp) {
      onTemperatureDetected(detectedTemp);
      setDetectedTemp(null);
    }
  };

  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold">{t.title}</h3>
        <p className="text-muted-foreground">
          {t.description}
        </p>

        {detectedTemp ? (
          <div className="space-y-4">
            <div className="p-6 bg-card rounded-lg border-2 border-primary">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-2">{t.detected}</p>
              <p className="text-4xl font-bold text-primary">{detectedTemp}</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={confirmTemperature} className="flex-1" size="lg">
                {t.confirm}
              </Button>
              <Button
                onClick={() => setDetectedTemp(null)}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                {t.retry}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              onClick={handleCameraCapture}
              disabled={isProcessing}
              className="flex-1"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  {t.processing}
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-5 w-5" />
                  {t.takePhoto}
                </>
              )}
            </Button>

            <label className="flex-1">
              <Button
                disabled={isProcessing}
                className="w-full"
                size="lg"
                asChild
              >
                <span>
                  <Upload className="mr-2 h-5 w-5" />
                  {t.uploadImage}
                </span>
              </Button>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                disabled={isProcessing}
              />
            </label>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ThermometerDetection;