import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, AlertCircle, Utensils, Pill, Calendar, Stethoscope, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SummaryData {
  condition: string;
  temperature?: string;
  severity: "emergency" | "moderate" | "simple";
  suggestions: string;
  recheckIn?: string;
  diet?: string;
  medicine?: string;
  specialists?: string;
}

interface SummaryCardProps {
  data: SummaryData;
  language: string;
  onDownload: () => void;
  onShare: () => void;
  onSave?: () => void;
}

const severityConfig = {
  emergency: {
    color: "border-red-500 bg-red-500/10",
    badge: "bg-red-500 text-white",
    icon: "🔴",
    label: "Emergency"
  },
  moderate: {
    color: "border-orange-500 bg-orange-500/10",
    badge: "bg-orange-500 text-white",
    icon: "🟠",
    label: "Moderate"
  },
  simple: {
    color: "border-green-500 bg-green-500/10",
    badge: "bg-green-500 text-white",
    icon: "🟢",
    label: "Simple/Mild"
  }
};

const SummaryCard = ({ data, language, onDownload, onShare, onSave }: SummaryCardProps) => {
  const config = severityConfig[data.severity];
  const navigate = useNavigate();
  const [showBookingDialog, setShowBookingDialog] = useState(false);

  const map = {
    en: {
      recDoctor: "Recommended Doctor",
      bookAppt: "Book Appointment",
      condition: "Condition",
      severity: "Severity",
      suggestions: "Suggestions",
      diet: "Diet Recommendations",
      medicine: "Medicine Recommendations",
      specialists: "Suggested Specialists",
      recheck: "Recheck in",
      download: "Download",
      share: "Share",
      save: "Save",
      temp: "Temperature",
      summary: "Health Summary",
      bookTitle: "Book an Appointment?",
      bookDesc: "Based on your symptoms, we recommend consulting a specialist. Do you want to proceed to book an appointment now?",
      cancel: "No, later",
      confirm: "Yes, Book Now"
    },
    hi: {
      recDoctor: "अनुशंसित डॉक्टर",
      bookAppt: "अपॉइंटमेंट बुक करें",
      condition: "स्थिति",
      severity: "गंभीरता",
      suggestions: "सुझाव",
      diet: "आहार सुझाव",
      medicine: "दवा सुझाव",
      specialists: "सुझाए गए विशेषज्ञ",
      recheck: "पुनः जांच",
      download: "डाउनलोड",
      share: "साझा करें",
      save: "सहेजें",
      temp: "तापमान",
      summary: "स्वास्थ्य सारांश",
      bookTitle: "अपॉइंटमेंट बुक करें?",
      bookDesc: "आपके लक्षणों के आधार पर, हम विशेषज्ञ से परामर्श की सलाह देते हैं। क्या आप अभी अपॉइंटमेंट बुक करना चाहते हैं?",
      cancel: "नहीं, बाद में",
      confirm: "हां, अभी बुक करें"
    },
    te: {
      recDoctor: "సిఫార్సు చేసిన డాక్టర్",
      bookAppt: "అపాయింట్‌మెంట్ బుక్ చేయండి",
      condition: "పరిస్థితి",
      severity: "తీవ్రత",
      suggestions: "సూచనలు",
      diet: "ఆహార సూచనలు",
      medicine: "మందుల సూచనలు",
      specialists: "సూచించిన నిపుణులు",
      recheck: "తిరిగి తనిఖీ చేయండి",
      download: "డౌన్‌లోడ్",
      share: "భాగస్వామ్యం",
      save: "సేవ్",
      temp: "ఉష్ణోగ్రత",
      summary: "ఆరోగ్య సారాంశం",
      bookTitle: "అపాయింట్‌మెంట్ బుక్ చేయాలా?",
      bookDesc: "మీ లక్షణాల ఆధారంగా, నిపుణుడిని సంప్రదించాలని మేము సిఫార్సు చేస్తున్నాము. మీరు ఇప్పుడే అపాయింట్‌మెంట్ బుక్ చేసుకోవాలనుకుంటున్నారా?",
      cancel: "వద్దు, తరువాత",
      confirm: "అవును, ఇప్పుడే బుక్ చేయండి"
    }
  };

  const t = map[language as keyof typeof map] || map.en;

  const handleBookAppointment = () => {
    let specialtyParam = "";
    if (data.specialists) {
      const lower = data.specialists.toLowerCase();
      if (lower.includes("cardiologist")) specialtyParam = "Cardiology";
      else if (lower.includes("dermatologist")) specialtyParam = "Dermatology";
      else if (lower.includes("pediatrician")) specialtyParam = "Pediatrics";
      else if (lower.includes("neurologist")) specialtyParam = "Neurology";
      else if (lower.includes("orthopedic")) specialtyParam = "Orthopedics";
      else if (lower.includes("oncologist")) specialtyParam = "Oncology";
      else if (lower.includes("nephrology") || lower.includes("nephrologist")) specialtyParam = "Nephrology";
      else if (lower.includes("gastroenterology") || lower.includes("gastroenterologist")) specialtyParam = "Gastroenterology";
    }

    const reason = `Condition: ${data.condition || "N/A"}
Severity: ${data.severity}
Suggestions: ${data.suggestions || "N/A"}`;

    navigate(`/hospitals?lang=${language}`, {
      state: {
        specialty: specialtyParam,
        reason: reason
      }
    });
  };

  return (
    <>
      <Card className={`p-6 border-2 ${config.color} animate-fade-in`}>
        <div className="space-y-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <AlertCircle className="w-8 h-8" />
                <h3 className="text-2xl font-bold">{t.summary}</h3>
              </div>
              <div className={`inline-block px-4 py-2 rounded-full ${config.badge} font-bold mb-4`}>
                {config.icon} {config.label}
              </div>
            </div>
          </div>

          <div className="space-y-3 text-lg">
            <div className="flex items-start gap-3 p-3 bg-card rounded-lg">
              <span className="font-bold min-w-fit">🩺 {t.condition}:</span>
              <span>{data.condition}</span>
            </div>

            {data.temperature && (
              <div className="flex items-start gap-3 p-3 bg-card rounded-lg">
                <span className="font-bold min-w-fit">🌡 {t.temp}:</span>
                <span>{data.temperature}</span>
              </div>
            )}

            <div className="flex items-start gap-3 p-3 bg-card rounded-lg">
              <span className="font-bold min-w-fit">💡 {t.suggestions}:</span>
              <span>{data.suggestions}</span>
            </div>

            {data.diet && (
              <div className="flex items-start gap-3 p-3 bg-card rounded-lg">
                <Utensils className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-bold block">{t.diet}:</span>
                  <span>{data.diet}</span>
                </div>
              </div>
            )}

            {data.medicine && (
              <div className="flex items-start gap-3 p-3 bg-card rounded-lg">
                <Pill className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-bold block">{t.medicine}:</span>
                  <span>{data.medicine}</span>
                </div>
              </div>
            )}

            {data.specialists && (
              <div className="flex items-start gap-3 p-3 bg-card rounded-lg">
                <Stethoscope className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <span className="font-bold block">{t.specialists}:</span>
                  <span>{data.specialists}</span>
                </div>
              </div>
            )}

            {data.recheckIn && (
              <div className="flex items-start gap-3 p-3 bg-card rounded-lg">
                <span className="font-bold min-w-fit">📅 {t.recheck}:</span>
                <span>{data.recheckIn}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button onClick={onDownload} className="flex-1" size="lg">
              <Download className="mr-2 h-5 w-5" />
              {t.download}
            </Button>
            <Button onClick={onShare} variant="outline" className="flex-1" size="lg">
              <Share2 className="mr-2 h-5 w-5" />
              {t.share}
            </Button>
            {onSave && (
              <Button onClick={onSave} variant="secondary" className="flex-1" size="lg">
                <Save className="mr-2 h-5 w-5" />
                {t.save}
              </Button>
            )}
          </div>

          {data.specialists && (
            <>
              <div className="pt-2">
                <Button
                  onClick={() => setShowBookingDialog(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg"
                  size="lg"
                >
                  <Calendar className="mr-2 h-5 w-5" />
                  {t.bookAppt}
                </Button>
              </div>
            </>
          )}
        </div>
      </Card>

      <AlertDialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.bookTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.bookDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction onClick={handleBookAppointment}>{t.confirm}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default SummaryCard;
