import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Upload, Loader2, CheckCircle2, Heart, Activity } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/utils/imageUtils";

interface BloodPressureDetectionProps {
  onBloodPressureDetected: (bp: { systolic: number; diastolic: number; pulse: number }) => void;
  language: string;
}

type Language = 'en' | 'hi' | 'te';

interface BPReading {
  systolic: number;
  diastolic: number;
  pulse: number;
}

const bpTranslations = {
  en: {
    title: "📸 AI Blood Pressure Reading",
    description: "Take a photo or upload an image of your BP monitor for instant reading",
    detected: "Detected Blood Pressure:",
    systolic: "Systolic",
    diastolic: "Diastolic",
    pulse: "Pulse",
    confirm: "✅ Correct, Use This",
    retry: "❌ Try Again",
    takePhoto: "Take Photo",
    uploadImage: "Upload Image",
    processing: "Processing...",
    successTitle: "✅ Blood Pressure Detected!",
    successDesc: "Reading detected successfully",
    errorTitle: "Error",
    errorDesc: "Could not read BP monitor. Please ensure the image is clear.",
    categories: {
      normal: "Normal",
      elevated: "Elevated",
      highStage1: "High Stage 1",
      highStage2: "High Stage 2",
      crisis: "Hypertensive Crisis"
    }
  },
  hi: {
    title: "📸 एआई रक्तचाप रीडिंग",
    description: "तुरंत रीडिंग के लिए अपने बीपी मॉनिटर की फोटो लें या छवि अपलोड करें",
    detected: "पता लगाया गया रक्तचाप:",
    systolic: "सिस्टोलिक",
    diastolic: "डायस्टोलिक",
    pulse: "नाड़ी",
    confirm: "✅ सही है, इसे उपयोग करें",
    retry: "❌ फिर से कोशिश करें",
    takePhoto: "फोटो लें",
    uploadImage: "छवि अपलोड करें",
    processing: "प्रसंस्करण...",
    successTitle: "✅ रक्तचाप पता चला!",
    successDesc: "रीडिंग सफलतापूर्वक पता चली",
    errorTitle: "त्रुटि",
    errorDesc: "बीपी मॉनिटर नहीं पढ़ सका। कृपया सुनिश्चित करें कि छवि स्पष्ट है।",
    categories: {
      normal: "सामान्य",
      elevated: "बढ़ा हुआ",
      highStage1: "उच्च चरण 1",
      highStage2: "उच्च चरण 2",
      crisis: "उच्च रक्तचाप संकट"
    }
  },
  te: {
    title: "📸 AI రక్తపోటు రీడింగ్",
    description: "తక్షణ రీడింగ్ కోసం మీ BP మానిటర్ ఫోటో తీయండి లేదా చిత్రాన్ని అప్‌లోడ్ చేయండి",
    detected: "గుర్తించబడిన రక్తపోటు:",
    systolic: "సిస్టోలిక్",
    diastolic: "డయాస్టోలిక్",
    pulse: "పల్స్",
    confirm: "✅ సరైనది, దీన్ని ఉపయోగించండి",
    retry: "❌ మళ్లీ ప్రయత్నించండి",
    takePhoto: "ఫోటో తీయండి",
    uploadImage: "చిత్రాన్ని అప్‌లోడ్ చేయండి",
    processing: "ప్రాసెస్ అవుతోంది...",
    successTitle: "✅ రక్తపోటు గుర్తించబడింది!",
    successDesc: "రీడింగ్ విజయవంతంగా గుర్తించబడింది",
    errorTitle: "లోపం",
    errorDesc: "BP మానిటర్ చదవలేకపోయింది. దయచేసి చిత్రం స్పష్టంగా ఉందని నిర్ధారించుకోండి.",
    categories: {
      normal: "సాధారణం",
      elevated: "పెరిగినది",
      highStage1: "అధిక దశ 1",
      highStage2: "అధిక దశ 2",
      crisis: "హైపర్‌టెన్సివ్ సంక్షోభం"
    }
  }
};

const getBPCategory = (systolic: number, diastolic: number, language: Language) => {
  const t = bpTranslations[language]?.categories || bpTranslations.en.categories;

  if (systolic > 180 || diastolic > 120) {
    return { label: t.crisis, color: "text-red-600 bg-red-100", severity: "crisis" };
  } else if (systolic >= 140 || diastolic >= 90) {
    return { label: t.highStage2, color: "text-orange-600 bg-orange-100", severity: "high2" };
  } else if ((systolic >= 130 && systolic < 140) || (diastolic >= 80 && diastolic < 90)) {
    return { label: t.highStage1, color: "text-yellow-600 bg-yellow-100", severity: "high1" };
  } else if (systolic >= 120 && systolic < 130 && diastolic < 80) {
    return { label: t.elevated, color: "text-amber-600 bg-amber-100", severity: "elevated" };
  } else {
    return { label: t.normal, color: "text-green-600 bg-green-100", severity: "normal" };
  }
};

const BloodPressureDetection = ({ onBloodPressureDetected, language }: BloodPressureDetectionProps) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [detectedBP, setDetectedBP] = useState<BPReading | null>(null);
  const { toast } = useToast();
  const t = bpTranslations[language as Language] || bpTranslations.en;

  const processImage = async (file: File) => {
    setIsProcessing(true);
    try {
      const base64Image = await compressImage(file);

      const { data, error } = await supabase.functions.invoke('detect-blood-pressure', {
        body: { image: base64Image, language }
      });

      if (error) {
        console.error("Supabase Function Error:", error);
        throw error;
      }

      if (data?.systolic && data?.diastolic) {
        setDetectedBP({
          systolic: data.systolic,
          diastolic: data.diastolic,
          pulse: data.pulse || 0
        });
        toast({
          title: t.successTitle,
          description: t.successDesc,
        });
      } else if (data?.error) {
        throw new Error(data.error);
      } else {
        throw new Error("Could not read blood pressure monitor");
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

  const confirmBloodPressure = () => {
    if (detectedBP) {
      onBloodPressureDetected(detectedBP);
      setDetectedBP(null);
    }
  };

  const bpCategory = detectedBP ? getBPCategory(detectedBP.systolic, detectedBP.diastolic, language as Language) : null;

  return (
    <Card className="p-6 bg-primary/5 border-primary/20">
      <div className="text-center space-y-4">
        <h3 className="text-xl font-bold">{t.title}</h3>
        <p className="text-muted-foreground">
          {t.description}
        </p>

        {detectedBP ? (
          <div className="space-y-4">
            <div className="p-6 bg-card rounded-lg border-2 border-primary">
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">{t.detected}</p>

              {/* Blood Pressure Display */}
              <div className="flex justify-center items-center gap-2 mb-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase">{t.systolic}</p>
                  <p className="text-4xl font-bold text-primary">{detectedBP.systolic}</p>
                </div>
                <span className="text-3xl text-muted-foreground">/</span>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground uppercase">{t.diastolic}</p>
                  <p className="text-4xl font-bold text-primary">{detectedBP.diastolic}</p>
                </div>
                <span className="text-muted-foreground ml-2">mmHg</span>
              </div>

              {/* Pulse */}
              {detectedBP.pulse > 0 && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-pink-500" />
                  <span className="text-sm text-muted-foreground">{t.pulse}:</span>
                  <span className="text-xl font-semibold text-pink-500">{detectedBP.pulse}</span>
                  <span className="text-sm text-muted-foreground">bpm</span>
                </div>
              )}

              {/* BP Category */}
              {bpCategory && (
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${bpCategory.color}`}>
                  <Heart className="w-4 h-4" />
                  <span className="font-semibold">{bpCategory.label}</span>
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button onClick={confirmBloodPressure} className="flex-1" size="lg">
                {t.confirm}
              </Button>
              <Button
                onClick={() => setDetectedBP(null)}
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

export default BloodPressureDetection;