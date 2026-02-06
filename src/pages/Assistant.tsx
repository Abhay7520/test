import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mic, MicOff, Send, Loader2, Heart, MapPin, MessageSquare,
  Volume2, VolumeX, Thermometer, Zap, Droplet, Wind, Stethoscope, X,
  BookOpen, PlayCircle, Camera, Sparkles, Activity, ChevronUp, ChevronDown
} from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import HealthcareMap from "@/components/HealthcareMap";
import HealthGuideModal from "@/components/HealthGuideModal";
import ThermometerDetection from "@/components/ThermometerDetection";
import BloodPressureDetection from "@/components/BloodPressureDetection";
import SummaryCard from "@/components/SummaryCard";

type Language = "en" | "te" | "hi";
type GuideType = "temperature" | "bp" | "hydration" | "breathing";
type Message = {
  role: "user" | "assistant";
  content: string;
  severity?: "emergency" | "moderate" | "simple";
};
type SummaryData = {
  condition: string;
  temperature?: string;
  severity: "emergency" | "moderate" | "simple";
  suggestions: string;
  recheckIn?: string;
  diet?: string;
  medicine?: string;
  specialists?: string;
};


const translations = {
  en: {
    title: "Health Assistant",
    subtitle: "Your AI companion",
    aiConsultation: "Chat",
    findFacilities: "Facilities",
    startConversation: "Start a conversation",
    typePlaceholder: "Tell me about your symptoms...",
    send: "Send",
    thinking: "Thinking...",
    recording: "Recording...",
    tempCheck: "Temperature",
    bpCheck: "Blood Pressure",
    hydrationCheck: "Hydration",
    breathingCheck: "Breathing",
    showThermometer: "Thermometer",
    showBloodPressure: "Blood Pressure",
    voiceOn: "Sound On",
    voiceOff: "Sound Off",
    error: "Error",
    errorDesc: "Failed to get response.",
    audioError: "Audio processing failed.",
    micError: "Microphone Error",
    micErrorDesc: "Microphone access failed.",
    conversationCleared: "Chat cleared",
    conversationClearedDesc: "Starting fresh.",
    noConversation: "No conversation",
    noConversationDesc: "Start talking first.",
    videoGuideTitle: {
      temperature: "Temperature Check",
      bp: "Blood Pressure Check",
      hydration: "Hydration Check",
      breathing: "Breathing Check"
    },
    checks: "Health Checks"
  },
  hi: {
    title: "स्वास्थ्य सहायक",
    subtitle: "आपका AI साथी",
    aiConsultation: "चैट",
    findFacilities: "सुविधाएं",
    startConversation: "बातचीत शुरू करें",
    typePlaceholder: "अपने लक्षण बताएं...",
    send: "भेजें",
    thinking: "सोच रहा हूं...",
    recording: "रिकॉर्डिंग...",
    tempCheck: "तापमान",
    bpCheck: "रक्तचाप",
    hydrationCheck: "जलयोजन",
    breathingCheck: "श्वास",
    showThermometer: "थर्मामीटर",
    showBloodPressure: "रक्तचाप",
    voiceOn: "ध्वनि चालू",
    voiceOff: "ध्वनि बंद",
    error: "त्रुटि",
    errorDesc: "प्रतिक्रिया विफल।",
    audioError: "ऑडियो विफल।",
    micError: "माइक त्रुटि",
    micErrorDesc: "माइक एक्सेस विफल।",
    conversationCleared: "चैट साफ",
    conversationClearedDesc: "नई शुरुआत।",
    noConversation: "चैट नहीं",
    noConversationDesc: "पहले बात करें।",
    videoGuideTitle: {
      temperature: "तापमान",
      bp: "रक्तचाप",
      hydration: "जलयोजन",
      breathing: "श्वास"
    },
    checks: "स्वास्थ्य जांच"
  },
  te: {
    title: "ఆరోగ్య సహాయకుడు",
    subtitle: "మీ AI సహచరుడు",
    aiConsultation: "చాట్",
    findFacilities: "సుविధలు",
    startConversation: "సంభాషణ ప్రారంభించండి",
    typePlaceholder: "మీ లక్షణాలను చెప్పండి...",
    send: "పంపండి",
    thinking: "ఆలోచిస్తోంది...",
    recording: "రికార్డింగ్...",
    tempCheck: "ఉష్ణోగ్రత",
    bpCheck: "రక్తపోటు",
    hydrationCheck: "హైడ్రేషన్",
    breathingCheck: "శ్వాస",
    showThermometer: "థర్మామీటర్",
    showBloodPressure: "రక్తపోటు",
    voiceOn: "సౌండ్ ఆన్",
    voiceOff: "సౌండ్ ఆఫ్",
    error: "లోపం",
    errorDesc: "ప్రతిస్పందన విఫలం।",
    audioError: "ఆడియో విఫలం।",
    micError: "మైక్ లోపం",
    micErrorDesc: "మైక్ ఆక్సెస్ విఫలం।",
    conversationCleared: "చాట్ క్లియర్",
    conversationClearedDesc: "కొత్త ప్రారంభం।",
    noConversation: "చాట్ లేదు",
    noConversationDesc: "ముందుగా మాట్లాడండి।",
    videoGuideTitle: {
      temperature: "ఉష్ణోగ్రత",
      bp: "రక్తపోటు",
      hydration: "హైడ్రేషన్",
      breathing: "శ్వాస"
    },
    checks: "ఆరోగ్య పరీక్షలు"
  }
};

// Thermometer Modal
const ThermometerModal = ({ isOpen, onClose, onTemperatureDetected, language }: {
  isOpen: boolean;
  onClose: () => void;
  onTemperatureDetected: (temp: string) => void;
  language: Language;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-teal-100 dark:border-teal-900 animate-slideUp">
        <div className="p-6 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center animate-pulse">
                <Thermometer className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Thermometer</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-white/20 text-white hover:rotate-90 transition-transform">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Take a photo or upload an image of your thermometer
          </p>
          <div className="flex-1 flex items-center justify-center">
            <ThermometerDetection
              onTemperatureDetected={(temp) => {
                onTemperatureDetected(temp);
                onClose();
              }}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Blood Pressure Modal
const BloodPressureModal = ({ isOpen, onClose, onBloodPressureDetected, language }: {
  isOpen: boolean;
  onClose: () => void;
  onBloodPressureDetected: (bp: { systolic: number; diastolic: number; pulse: number }) => void;
  language: Language;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-pink-100 dark:border-pink-900 animate-slideUp">
        <div className="p-6 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-white/20 backdrop-blur flex items-center justify-center animate-pulse">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white">AI Blood Pressure</h3>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-white/20 text-white hover:rotate-90 transition-transform">
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
            Take a photo or upload an image of your BP monitor
          </p>
          <div className="flex-1 flex items-center justify-center">
            <BloodPressureDetection
              onBloodPressureDetected={(bp) => {
                onBloodPressureDetected(bp);
                onClose();
              }}
              language={language}
            />
          </div>
        </div>
      </div>
    </div>
  );
};


// Video Guide Modal
const VideoGuideModal = ({ isOpen, onClose, guideType, language }: {
  isOpen: boolean;
  onClose: () => void;
  guideType: GuideType | null;
  language: Language;
}) => {
  const t = translations[language];
  if (!isOpen || !guideType) return null;

  const videoUrls = {
    temperature: { en: "/videos/temp-eng.mp4", hi: "/videos/temphindi.mp4", te: "/videos/temptel.mp4" },
    bp: { en: "/videos/bp-eng.mp4", hi: "/videos/bp-hin.mp4", te: "/videos/bp-tel.mp4" },
    hydration: { en: "/videos/dehydration-eng.mp4", hi: "/videos/dehydration-hin.mp4", te: "/videos/dehydration-tel.mp4" },
    breathing: { en: "/videos/breathe-eng.mp4", hi: "/videos/breath-hin.mp4", te: "/videos/breathe-tel.mp4" }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden border border-teal-100 dark:border-teal-900 animate-slideUp">
        <div className="p-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white">{t.videoGuideTitle[guideType]}</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0 hover:bg-white/20 text-white hover:rotate-90 transition-transform">
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="p-4">
          <div className="aspect-video bg-black rounded-lg overflow-hidden">
            <video key={`${guideType}-${language}`} className="w-full h-full" controls autoPlay src={videoUrls[guideType][language]} />
          </div>
        </div>
      </div>
    </div>
  );
};

// Health Check Item Component with smooth hover animation
const HealthCheckItem = ({
  type,
  label,
  icon: Icon,
  color,
  onGuideClick,
  onVideoGuideClick
}: {
  type: GuideType;
  label: string;
  icon: any;
  color: string;
  onGuideClick: () => void;
  onVideoGuideClick: () => void;
}) => {
  const [hoveredItem, setHoveredItem] = useState(false);

  return (
    <div
      className="space-y-0 relative"
      onMouseEnter={() => setHoveredItem(true)}
      onMouseLeave={() => setHoveredItem(false)}
    >
      {/* Glow effect on hover */}
      {hoveredItem && (
        <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl blur-sm" />
      )}

      {/* Main button */}
      <button
        className="relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-800/80 backdrop-blur-sm text-slate-200 hover:text-white text-sm transition-all duration-300 transform hover:scale-[1.02] border border-slate-700/50 hover:border-slate-600/80 group overflow-hidden"
      >
        {/* Subtle animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

        <div className={`${color} p-2.5 rounded-lg flex-shrink-0 shadow-lg group-hover:shadow-xl transition-all relative z-10`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <span className="truncate flex-1 text-left font-semibold relative z-10">{label}</span>
      </button>

      {/* Quick action buttons */}
      <div className={`overflow-hidden transition-all duration-300 ease-out ${hoveredItem ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="flex gap-2 px-1 pt-2 pb-0">
          <button
            onClick={onGuideClick}
            title="Read Guide"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-slate-800/40 hover:bg-slate-700/60 backdrop-blur rounded-lg text-xs text-slate-300 hover:text-white transition-all transform hover:scale-105 border border-slate-700/40 hover:border-slate-600/60 group"
          >
            <BookOpen className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-medium">Guide</span>
          </button>
          <button
            onClick={onVideoGuideClick}
            title="Watch Video"
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-teal-600/70 to-cyan-600/70 hover:from-teal-500 hover:to-cyan-500 rounded-lg text-xs text-white transition-all transform hover:scale-105 border border-teal-500/50 hover:border-teal-400 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 group"
          >
            <PlayCircle className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline font-medium">Video</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Fixed Sidebar Navigation with smooth animations
const Sidebar = ({
  language,
  onGuideClick,
  onVideoGuideClick,
  onShowThermometer,
  onShowBloodPressure
}: {
  language: Language;
  onGuideClick: (type: GuideType) => void;
  onVideoGuideClick: (type: GuideType) => void;
  onShowThermometer: () => void;
  onShowBloodPressure: () => void;
}) => {
  const t = translations[language];

  const guides = [
    { type: "temperature" as GuideType, label: t.tempCheck, icon: Thermometer, color: "bg-gradient-to-br from-red-500 to-orange-500", glow: "shadow-red-500/50" },
    { type: "bp" as GuideType, label: t.bpCheck, icon: Zap, color: "bg-gradient-to-br from-pink-500 to-rose-500", glow: "shadow-pink-500/50" },
    { type: "hydration" as GuideType, label: t.hydrationCheck, icon: Droplet, color: "bg-gradient-to-br from-blue-500 to-cyan-500", glow: "shadow-blue-500/50" },
    { type: "breathing" as GuideType, label: t.breathingCheck, icon: Wind, color: "bg-gradient-to-br from-green-500 to-emerald-500", glow: "shadow-green-500/50" }
  ];

  return (
    <div className="w-72 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-r border-slate-700/50 h-screen flex flex-col overflow-y-auto relative">
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 via-transparent to-purple-500/5 pointer-events-none" />

      {/* Header */}
      <div className="p-5 sticky top-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 animate-slideDown z-10 relative">
        <Link to="/" className="flex items-center gap-3 group cursor-pointer">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-teal-500/50 group-hover:shadow-teal-400/70 group-hover:scale-110 transition-all duration-300 animate-pulse">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold bg-gradient-to-r from-teal-300 via-cyan-300 to-blue-300 bg-clip-text text-transparent group-hover:from-teal-200 group-hover:via-cyan-200 group-hover:to-blue-200 transition-all">SwasthAI</h2>
            <p className="text-xs text-slate-400 font-medium">AI Health Assistant</p>
          </div>
        </Link>
      </div>

      {/* Health Checks */}
      <div className="flex-1 px-4 py-6 relative">
        <div className="flex items-center gap-2 mb-4 animate-fadeIn">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
          <h3 className="text-xs font-bold text-teal-400/80 uppercase tracking-wider">Health Checks</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-teal-500/30 to-transparent" />
        </div>
        <div className="space-y-3">
          {guides.map(({ type, label, icon, color, glow }, idx) => (
            <div key={type} className="animate-slideUp" style={{ animationDelay: `${idx * 50}ms` }}>
              <HealthCheckItem
                type={type}
                label={label}
                icon={icon}
                color={color}
                onGuideClick={() => onGuideClick(type)}
                onVideoGuideClick={() => onVideoGuideClick(type)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* AI Detection Tools */}
      <div className="px-4 py-6 border-t border-slate-700/50 space-y-3 relative">
        <div className="flex items-center gap-2 mb-3 animate-fadeIn">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
          <h3 className="text-xs font-bold text-purple-400/80 uppercase tracking-wider">AI Detection</h3>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
        </div>

        {/* AI Thermometer */}
        <div className="relative animate-slideUp" style={{ animationDelay: "200ms" }}>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
          <button
            onClick={onShowThermometer}
            className="relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-purple-500/20 hover:from-purple-500/30 hover:via-pink-500/30 hover:to-purple-500/30 text-white text-sm transition-all duration-300 transform hover:scale-105 border border-purple-400/30 hover:border-purple-400/60 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2.5 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/50 relative z-10">
              <Camera className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left relative z-10">
              <div className="font-semibold">{t.showThermometer}</div>
              <div className="text-xs text-purple-300/80">AI Detection</div>
            </div>
            <Sparkles className="w-4 h-4 text-purple-300 flex-shrink-0 animate-pulse relative z-10" />
          </button>
        </div>

        {/* AI Blood Pressure */}
        <div className="relative animate-slideUp" style={{ animationDelay: "250ms" }}>
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
          <button
            onClick={onShowBloodPressure}
            className="relative w-full flex items-center gap-3 px-4 py-3.5 rounded-xl bg-gradient-to-r from-pink-500/20 via-rose-500/20 to-red-500/20 hover:from-pink-500/30 hover:via-rose-500/30 hover:to-red-500/30 text-white text-sm transition-all duration-300 transform hover:scale-105 border border-pink-400/30 hover:border-pink-400/60 group overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-rose-500/10 to-red-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-2.5 rounded-lg flex-shrink-0 group-hover:scale-110 transition-transform shadow-lg shadow-pink-500/50 relative z-10">
              <Activity className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 text-left relative z-10">
              <div className="font-semibold">{t.showBloodPressure}</div>
              <div className="text-xs text-pink-300/80">AI Detection</div>
            </div>
            <Sparkles className="w-4 h-4 text-pink-300 flex-shrink-0 animate-pulse relative z-10" />
          </button>
        </div>


      </div>
    </div>
  );
};

const Assistant = () => {
  const [searchParams] = useSearchParams();
  const { language } = useLanguage();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [showThermometerModal, setShowThermometerModal] = useState(false);
  const [showBloodPressureModal, setShowBloodPressureModal] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<GuideType | null>(null);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState("chat");

  const { toast } = useToast();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = translations[language];

  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    scrollToBottom();

    if (summaryData) {
      setTimeout(scrollToBottom, 100);
    }
  }, [messages, isLoading, summaryData]);

  const startRecording = async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({ title: "Not Supported", description: "Speech recognition not available.", variant: "destructive" });
        return;
      }

      const recognition = new SpeechRecognition();
      mediaRecorderRef.current = recognition as any;
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = language === 'te' ? 'te-IN' : language === 'hi' ? 'hi-IN' : 'en-US';

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsRecording(false);
        await sendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        toast({ title: t.error, description: t.audioError, variant: "destructive" });
      };

      recognition.onend = () => setIsRecording(false);
      recognition.start();
      setIsRecording(true);
    } catch (error) {
      toast({ title: t.micError, description: t.micErrorDesc, variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        (mediaRecorderRef.current as any).stop();
      } catch (error) {
        console.error("Error:", error);
      }
      setIsRecording(false);
    }
  };

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('health-assistant', {
        body: { message: text, language, conversationHistory: messages }
      });

      if (error) throw error;

      if (data?.error) {
        throw new Error(data.details || data.error);
      }

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        severity: data.severity
      };
      setMessages(prev => [...prev, assistantMessage]);
      if (data.summary) setSummaryData(data.summary);

      if (isTtsEnabled && data.response) {
        try {
          const { data: audioData, error: ttsError } = await supabase.functions.invoke('text-to-speech', {
            body: { text: data.response, language }
          });

          if (ttsError) {
            console.warn("TTS unavailable:", ttsError);
          } else if (audioData?.audioContent) {
            const audio = new Audio(`data:audio/mp3;base64,${audioData.audioContent}`);
            audio.play().catch(err => console.error("Audio playback error:", err));
          }
        } catch (ttsError) {
          console.warn("TTS service error:", ttsError);
        }
      }
    } catch (error: any) {
      console.error("Assistant Error:", error);
      let errorMessage = t.errorDesc;
      if (error.message) {
        errorMessage += ` (${error.message})`;
      }
      toast({ title: t.error, description: errorMessage, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSummary = async () => {
    if (!user?.id || !summaryData) {
      toast({ title: "Error", description: "Please login to save records.", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('medical_records')
        .insert({
          user_id: user.id,
          title: `Health Summary - ${new Date().toLocaleDateString()}`,
          type: 'consultation_summary',
          date: new Date().toISOString().split('T')[0],
          summary_data: summaryData as any,
          doctor_name: 'SwasthAI Assistant'
        });

      if (error) throw error;
      toast({ title: "Success", description: "Health summary saved to records." });
    } catch (error) {
      console.error("Error saving summary:", error);
      toast({ title: "Error", description: "Failed to save summary.", variant: "destructive" });
    }
  };

  const handleStartOver = () => {
    setMessages([]);
    setSummaryData(null);
    setInput("");
    toast({ title: t.conversationCleared, description: t.conversationClearedDesc });
  };

  const handleDownloadSummary = () => {
    if (messages.length === 0) {
      toast({ title: t.noConversation, description: t.noConversationDesc, variant: "destructive" });
      return;
    }

    let conversationText = "FULL CONVERSATION HISTORY\n";
    conversationText += "=========================\n\n";

    messages.forEach((msg, idx) => {
      const role = msg.role === "user" ? "Patient/User" : "SwasthAI Assistant";
      conversationText += `[${role}]:\n${msg.content}\n`;
      if (msg.severity) {
        conversationText += `Severity: ${msg.severity.toUpperCase()}\n`;
      }
      conversationText += "\n---\n\n";
    });

    if (summaryData) {
      conversationText += "\n\nHEALTH SUMMARY\n";
      conversationText += "==============\n\n";
      conversationText += `Condition: ${summaryData.condition}\n`;
      if (summaryData.temperature) {
        conversationText += `Temperature: ${summaryData.temperature}\n`;
      }
      conversationText += `Severity: ${summaryData.severity.toUpperCase()}\n`;
      if (summaryData.recheckIn) {
        conversationText += `Recheck In: ${summaryData.recheckIn}\n`;
      }
      conversationText += `\nSuggestions:\n${summaryData.suggestions}\n`;
      if (summaryData.diet) {
        conversationText += `\nDiet Recommendations:\n${summaryData.diet}\n`;
      }
      if (summaryData.medicine) {
        conversationText += `\nMedicine Recommendations:\n${summaryData.medicine}\n`;
      }
      if (summaryData.specialists) {
        conversationText += `\nSuggested Specialists:\n${summaryData.specialists}\n`;
      }
    }


    conversationText += `\n\nLanguage: ${language.toUpperCase()}\n`;
    conversationText += `Generated on: ${new Date().toLocaleString()}\n`;
    conversationText += "\n---\n";
    conversationText += "SwasthAI - Your Healthcare Assistant\n";

    const blob = new Blob([conversationText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `swasthai-report-${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({ title: "Downloaded", description: "Health report saved successfully!" });
  };

  const handleShareReport = () => {
    if (messages.length === 0) {
      toast({ title: t.noConversation, description: t.noConversationDesc, variant: "destructive" });
      return;
    }

    let shareText = "SwasthAI Health Report\n\n";

    if (summaryData) {
      shareText += `Condition: ${summaryData.condition}\n`;
      shareText += `Severity: ${summaryData.severity.toUpperCase()}\n`;
      if (summaryData.temperature) {
        shareText += `Temperature: ${summaryData.temperature}\n`;
      }
      shareText += `\nSuggestions: ${summaryData.suggestions}\n`;
      if (summaryData.diet) {
        shareText += `\nDiet: ${summaryData.diet}\n`;
      }
      if (summaryData.medicine) {
        shareText += `\nMedicine: ${summaryData.medicine}\n`;
      }
      if (summaryData.specialists) {
        shareText += `\nSpecialists: ${summaryData.specialists}\n`;
      }

    } else {
      const lastMessages = messages.slice(-2);
      lastMessages.forEach(msg => {
        shareText += `${msg.role === "user" ? "Q" : "A"}: ${msg.content}\n\n`;
      });
    }

    shareText += "\n- Generated by SwasthAI";

    const encodedText = encodeURIComponent(shareText);

    if (navigator.share) {
      navigator.share({
        title: "SwasthAI Health Report",
        text: shareText,
      }).catch(err => console.log("Share cancelled", err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast({
          title: "Copied to clipboard!",
          description: "Report copied. You can now paste it anywhere.",
          duration: 3000
        });
      });

      const whatsappUrl = `https://wa.me/?text=${encodedText}`;
      window.open(whatsappUrl, "_blank");
    }

  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="h-screen flex bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar
        language={language}
        onGuideClick={(type) => {
          setSelectedGuide(type);
          setShowGuideModal(true);
        }}
        onVideoGuideClick={(type) => {
          setSelectedGuide(type);
          setShowVideoModal(true);
        }}
        onShowThermometer={() => setShowThermometerModal(true)}
        onShowBloodPressure={() => setShowBloodPressureModal(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header with gradient blend */}
        <div className="h-20 bg-gradient-to-r from-teal-50 via-cyan-50 to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700/50 flex items-center px-8 shadow-lg sticky top-0 z-20 backdrop-blur-xl animate-slideDown relative overflow-hidden">
          {/* Animated gradient background */}
          <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 via-cyan-500/5 to-blue-500/5 dark:from-teal-500/10 dark:via-cyan-500/10 dark:to-blue-500/10 animate-pulse" />

          <div className="relative z-10 flex-1 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-xl shadow-teal-500/30 animate-pulse">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent">{t.title}</h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Powered by AI • Multilingual Support</p>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="ml-auto relative z-10">
            <TabsList className="grid grid-cols-2 gap-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg border border-slate-200/50 dark:border-slate-700/50 p-1.5 rounded-xl">
              <TabsTrigger value="chat" className="text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-300 rounded-lg px-4 py-2.5">
                <MessageSquare className="w-4 h-4 md:mr-2" />
                <span className="hidden sm:inline">{t.aiConsultation}</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="text-sm font-semibold data-[state=active]:bg-gradient-to-r data-[state=active]:from-teal-500 data-[state=active]:to-cyan-500 data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-teal-500/30 transition-all duration-300 rounded-lg px-4 py-2.5">
                <MapPin className="w-4 h-4 md:mr-2" />
                <span className="hidden sm:inline">{t.findFacilities}</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-2 ml-6 relative z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleStartOver}
              className="hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-300 rounded-lg px-3 py-2 font-semibold border border-transparent hover:border-red-500/30"
              disabled={messages.length === 0}
            >
              <X className="w-4 h-4 mr-1.5" />
              <span className="hidden sm:inline text-xs">Start Over</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsTtsEnabled(!isTtsEnabled)}
              title={isTtsEnabled ? t.voiceOn : t.voiceOff}
              className="hover:bg-teal-500/20 hover:text-teal-600 dark:hover:text-teal-400 transition-all duration-300 w-10 h-10 rounded-lg border border-transparent hover:border-teal-500/30"
            >
              {isTtsEnabled ? <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </Button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeTab === 'chat' ? (
            <>
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-8 space-y-6 scroll-smooth bg-gradient-to-b from-slate-50/50 to-white dark:from-slate-950/50 dark:to-slate-900">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center animate-fadeIn">
                    <div className="text-center max-w-lg">
                      <div className="relative inline-block mb-6">
                        {/* Pulsing rings */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 opacity-20 animate-ping" />
                        <div className="absolute inset-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 opacity-30 animate-pulse" />

                        {/* Main icon */}
                        <div className="relative w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 flex items-center justify-center shadow-2xl shadow-teal-500/50 animate-bounce">
                          <Heart className="w-10 h-10 text-white animate-pulse" />
                        </div>
                      </div>

                      <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 dark:from-teal-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mb-3 animate-slideUp">{t.title}</h2>
                      <p className="text-slate-600 dark:text-slate-400 animate-slideUp text-lg" style={{ animationDelay: '100ms' }}>{t.startConversation}</p>

                      {/* Feature highlights */}
                      <div className="flex items-center justify-center gap-4 mt-8 text-xs text-slate-500 dark:text-slate-500 animate-slideUp" style={{ animationDelay: '200ms' }}>
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                          <span className="font-medium">AI-Powered</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                          <span className="font-medium">Multilingual</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                          <span className="font-medium">24/7 Available</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => (
                      <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slideUp`} style={{ animationDelay: `${index * 50}ms` }}>
                        <div className={`max-w-xs md:max-w-md lg:max-w-2xl p-4 rounded-2xl whitespace-pre-wrap text-sm shadow-xl transform transition-all hover:shadow-2xl relative ${message.role === "user"
                          ? "bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 text-white rounded-br-sm hover:scale-[1.02] shadow-teal-500/30"
                          : message.severity === "emergency"
                            ? "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/80 dark:to-red-900/50 text-red-900 dark:text-red-100 border-l-4 border-red-500 rounded-bl-sm shadow-red-500/20"
                            : message.severity === "moderate"
                              ? "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/80 dark:to-orange-900/50 text-orange-900 dark:text-orange-100 border-l-4 border-orange-500 rounded-bl-sm shadow-orange-500/20"
                              : message.severity === "simple"
                                ? "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/80 dark:to-green-900/50 text-green-900 dark:text-green-100 border-l-4 border-green-500 rounded-bl-sm shadow-green-500/20"
                                : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700"
                          }`}>
                          {message.severity && message.role === "assistant" && (
                            <div className="mb-2 font-bold text-sm flex items-center gap-2">
                              {message.severity === "emergency" && (
                                <>
                                  <span className="flex h-2.5 w-2.5">
                                    <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
                                  </span>
                                  Emergency
                                </>
                              )}
                              {message.severity === "moderate" && (
                                <>
                                  <span className="flex h-2.5 w-2.5">
                                    <span className="animate-pulse absolute inline-flex h-2.5 w-2.5 rounded-full bg-orange-500 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-600" />
                                  </span>
                                  Moderate
                                </>
                              )}
                              {message.severity === "simple" && (
                                <>
                                  <span className="flex h-2.5 w-2.5 rounded-full bg-green-500" />
                                  Simple
                                </>
                              )}
                            </div>
                          )}
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start animate-slideUp">
                        <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-2xl rounded-bl-sm flex items-center gap-3 shadow-xl">
                          <div className="relative">
                            <Loader2 className="w-5 h-5 animate-spin text-teal-600" />
                            <div className="absolute inset-0 w-5 h-5 animate-ping rounded-full bg-teal-500/30" />
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400 font-medium">{t.thinking}</span>
                        </div>
                      </div>
                    )}
                    {isRecording && (
                      <div className="flex justify-center animate-fadeIn">
                        <div className="bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 text-red-700 dark:text-red-300 px-5 py-3 rounded-full flex items-center gap-3 text-sm font-semibold animate-pulse border-2 border-red-300 dark:border-red-800 shadow-xl shadow-red-500/30">
                          <div className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600" />
                          </div>
                          {t.recording}
                        </div>
                      </div>
                    )}

                  </>
                )}
              </div>

              {summaryData && (
                <div className={`px-6 bg-white dark:bg-gray-800 border-t border-teal-200/20 dark:border-teal-800/20 animate-slideUp relative transition-all duration-300 ${isSummaryCollapsed ? 'py-2' : 'py-3'}`}>
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6 rounded-full shadow-md bg-white dark:bg-slate-800 border-teal-200 dark:border-teal-800 hover:bg-teal-50 dark:hover:bg-slate-700"
                      onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
                    >
                      {isSummaryCollapsed ? (
                        <ChevronUp className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                      )}
                    </Button>
                  </div>

                  {!isSummaryCollapsed ? (
                    <SummaryCard
                      data={summaryData}
                      onDownload={handleDownloadSummary}
                      onShare={handleShareReport}
                      onSave={handleSaveSummary}
                    />
                  ) : (
                    <div className="text-center">
                      <span className="text-xs font-medium text-teal-600 dark:text-teal-400">Health Summary Available</span>
                    </div>
                  )}
                </div>
              )}
              <div ref={messagesEndRef} />


              {/* Input Area */}
              <div className="bg-gradient-to-r from-white via-slate-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 backdrop-blur-xl border-t border-slate-200 dark:border-slate-700/50 p-6 shadow-2xl">
                <form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4">
                  <div className="flex-1 relative">
                    {/* Input glow effect */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-2xl opacity-20 blur group-focus-within:opacity-40 transition" />

                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder={t.typePlaceholder}
                      className="relative flex-1 min-h-14 max-h-32 resize-none border-2 border-slate-200 dark:border-slate-700 focus:border-teal-500 dark:focus:border-teal-400 transition-all shadow-lg rounded-2xl px-4 py-3 text-sm bg-white dark:bg-slate-800 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <Button
                      type="button"
                      size="icon"
                      onClick={isRecording ? stopRecording : startRecording}
                      disabled={isLoading}
                      className={`h-14 w-14 transition-all transform hover:scale-110 active:scale-95 rounded-xl shadow-xl relative overflow-hidden ${isRecording
                        ? "bg-gradient-to-br from-red-500 to-pink-600 hover:from-red-400 hover:to-pink-500 animate-pulse shadow-red-500/50"
                        : "bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:via-cyan-500 hover:to-blue-500 shadow-teal-500/30"
                        }`}
                    >
                      {/* Animated background glow */}
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-pulse" />

                      {isRecording ? (
                        <MicOff className="w-5 h-5 relative z-10" />
                      ) : (
                        <Mic className="w-5 h-5 relative z-10" />
                      )}
                    </Button>
                    <Button
                      type="submit"
                      size="icon"
                      disabled={isLoading || !input.trim()}
                      className="h-14 w-14 bg-gradient-to-br from-teal-600 via-cyan-600 to-blue-600 hover:from-teal-500 hover:via-cyan-500 hover:to-blue-500 shadow-xl shadow-teal-500/30 transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl relative overflow-hidden group"
                    >
                      {/* Shine effect on hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

                      <Send className="w-5 h-5 relative z-10" />
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            /* Map Tab */
            <div className="flex-1 w-full animate-fadeIn">
              <HealthcareMap />
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <ThermometerModal
        isOpen={showThermometerModal}
        onClose={() => setShowThermometerModal(false)}
        onTemperatureDetected={(temp) => sendMessage(`My temperature is ${temp}`)}
        language={language}
      />

      <BloodPressureModal
        isOpen={showBloodPressureModal}
        onClose={() => setShowBloodPressureModal(false)}
        onBloodPressureDetected={(bp) => sendMessage(`My blood pressure is ${bp.systolic}/${bp.diastolic} mmHg with pulse ${bp.pulse} bpm`)}
        language={language}
      />

      <VideoGuideModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        guideType={selectedGuide}
        language={language}
      />

      <HealthGuideModal
        isOpen={showGuideModal}
        onClose={() => setShowGuideModal(false)}
        guideType={selectedGuide}
      />

      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .animate-slideUp {
          animation: slideUp 0.5s ease-out forwards;
          opacity: 0;
        }

        .animate-slideDown {
          animation: slideDown 0.5s ease-out forwards;
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }

        .animate-bounce {
          animation: bounce 2s infinite;
        }

        .animate-pulse {
          animation: pulse 2s infinite;
        }

        .scroll-smooth {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default Assistant;