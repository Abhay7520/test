import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, X, Send, Mic, Globe, VolumeX, Volume2 } from 'lucide-react';
import { useSpeechRecognition } from 'react-speech-recognition';
import { useSpeechSynthesis } from 'react-speech-kit';
import { useNavigate } from 'react-router-dom';
import SpeechWave from '../ui/SpeechWave';
import { useAuth } from '../../context/AuthContext';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { toast } from 'react-hot-toast';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  language?: string;
}

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AuralAid assistant. How can I help you with your healthcare needs today?',
      sender: 'bot',
      timestamp: new Date(),
      language: 'en'
    }
  ]);
  const [isListening, setIsListening] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'hi' | 'te'>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const { speak, cancel, speaking } = useSpeechSynthesis();
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  const languageConfig = {
    en: {
      label: 'English',
      voiceURI: 'Google UK English Female',
      welcomeMessage: 'Hello! How can I help you today?',
      speechLang: 'en-US',
      responses: {
        appointment: "I'll help you book an appointment. Let me take you to the booking page.",
        hospital: "We have several top hospitals in our network. Would you like to see the list?",
        emergency: "If this is a medical emergency, please call emergency services immediately at 102 or visit your nearest emergency room.",
        default: "I'm here to help with appointments, finding hospitals, or connecting you with specialists. How can I assist you?"
      }
    },
    hi: {
      label: 'हिंदी',
      voiceURI: 'Google हिन्दी',
      welcomeMessage: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूं?',
      speechLang: 'hi-IN',
      responses: {
        appointment: "मैं आपकी अपॉइंटमेंट बुक करने में मदद करूंगा। मैं आपको बुकिंग पेज पर ले जा रहा हूं।",
        hospital: "हमारे नेटवर्क में कई टॉप अस्पताल हैं। क्या आप सूची देखना चाहेंगे?",
        emergency: "अगर यह एक मेडिकल इमरजेंसी है, तो कृपया तुरंत 102 पर कॉल करें या नजदीकी इमरजेंसी रूम में जाएं।",
        default: "मैं अपॉइंटमेंट, अस्पताल खोजने, या विशेषज्ञों से जुड़ने में आपकी मदद कर सकता हूं। मैं आपकी कैसे सहायता कर सकता हूं?"
      }
    },
    te: {
      label: 'తెలుగు',
      voiceURI: 'Google తెలుగు',
      welcomeMessage: 'నమస్కారం! నేను మీకు ఎలా సహాయం చేయగలను?',
      speechLang: 'te-IN',
      responses: {
        appointment: "నేను మీ అపాయింట్మెంట్ బుక్ చేయడంలో సహాయం చేస్తాను. నేను మిమ్మల్ని బుకింగ్ పేజీకి తీసుకెళ్తున్నాను.",
        hospital: "మా నెట్‌వర్క్‌లో చాలా టాప్ ఆసుపత్రులు ఉన్నాయి. మీరు జాబితాను చూడాలనుకుంటున్నారా?",
        emergency: "ఇది మెడికల్ ఎమర్జెన్సీ అయితే, దయచేసి వెంటనే 102కి కాల్ చేయండి లేదా సమీప ఎమర్జెన్సీ రూమ్‌కి వెళ్లండి.",
        default: "నేను అపాయింట్మెంట్లు, ఆసుపత్రులను కనుగొనడం లేదా స్పెషలిస్ట్‌లతో కనెక్ట్ కావడంలో సహాయం చేయగలను. నేను మీకు ఎలా సహాయం చేయగలను?"
      }
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (transcript) {
      setInput(transcript);
    }
  }, [transcript]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      resetTranscript();
    }
  };

  const handleLanguageChange = (lang: 'en' | 'hi' | 'te') => {
    setSelectedLanguage(lang);
    const welcomeMessage = {
      id: Date.now().toString(),
      text: languageConfig[lang].welcomeMessage,
      sender: 'bot' as const,
      timestamp: new Date(),
      language: lang
    };
    setMessages(prev => [...prev, welcomeMessage]);
    speakMessage(welcomeMessage.text, lang);
  };

  const speakMessage = (text: string, language: string) => {
    if (isSpeaking) {
      cancel();
      setIsSpeaking(false);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.voiceURI === languageConfig[language as keyof typeof languageConfig].voiceURI);
    
    const utterance = {
      text,
      voice,
      lang: languageConfig[language as keyof typeof languageConfig].speechLang,
      rate: 1,
      pitch: 1,
      onend: () => setIsSpeaking(false)
    };

    speak(utterance);
    setIsSpeaking(true);
  };

  const handleVoiceInput = () => {
    if (!browserSupportsSpeechRecognition) {
      const errorMessage = {
        id: Date.now().toString(),
        text: "Sorry, your browser doesn't support speech recognition.",
        sender: 'bot' as const,
        timestamp: new Date(),
        language: selectedLanguage
      };
      setMessages(prev => [...prev, errorMessage]);
      return;
    }

    setIsListening(!isListening);
    if (isListening) {
      resetTranscript();
    }
  };

  const processAppointmentBooking = async (text: string) => {
    if (currentUser) {
      try {
        // Update user's appointments in Firestore
        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
          appointments: arrayUnion({
            id: Date.now().toString(),
            type: 'appointment_request',
            text,
            timestamp: new Date(),
            status: 'pending'
          })
        });

        // Refresh appointments in context
        await refreshAppointments();
        
        navigate('/hospitals');
        
        const confirmMessage = {
          id: Date.now().toString(),
          text: languageConfig[selectedLanguage].responses.appointment,
          sender: 'bot' as const,
          timestamp: new Date(),
          language: selectedLanguage
        };
        setMessages(prev => [...prev, confirmMessage]);
        speakMessage(confirmMessage.text, selectedLanguage);
      } catch (error) {
        console.error('Error processing appointment:', error);
        toast.error('Failed to process appointment request');
      }
    } else {
      navigate('/login');
      toast.error('Please login to book appointments');
    }
  };

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    const responses = languageConfig[selectedLanguage].responses;
    
    if (input.includes('appointment') || input.includes('book') || 
        input.includes('अपॉइंटमेंट') || input.includes('बुक') ||
        input.includes('అపాయింట్మెంట్') || input.includes('బుక్')) {
      processAppointmentBooking(userInput);
      return responses.appointment;
    } else if (input.includes('hospital') || input.includes('clinic') ||
               input.includes('अस्पताल') || input.includes('क्लिनिक') ||
               input.includes('ఆసుపత్రి') || input.includes('క్లినిక్')) {
      navigate('/hospitals');
      return responses.hospital;
    } else if (input.includes('emergency') || 
               input.includes('इमरजेंसी') ||
               input.includes('ఎమర్జెన్సీ')) {
      return responses.emergency;
    }
    return responses.default;
  };

  const sendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      id: Date.now().toString(),
      text: input,
      sender: 'user' as const,
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    resetTranscript();

    // Get bot response
    const botResponse = getBotResponse(input);
    const responseMessage = {
      id: (Date.now() + 1).toString(),
      text: botResponse,
      sender: 'bot' as const,
      timestamp: new Date(),
      language: selectedLanguage
    };

    setMessages(prev => [...prev, responseMessage]);
    speakMessage(botResponse, selectedLanguage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={toggleChat}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary-500 text-white shadow-lg hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:ring-offset-2"
      >
        {isOpen ? <X size={24} /> : <MessageCircle size={24} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-24 right-5 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between bg-primary-500 px-4 py-3 text-white">
              <div className="flex items-center">
                <div className="mr-3 rounded-full bg-white p-1.5">
                  <MessageCircle size={20} className="text-primary-500" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold">AuralAid Assistant</h3>
                  <p className="text-xs text-primary-100">AI-powered | Voice-enabled</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => handleLanguageChange(e.target.value as 'en' | 'hi' | 'te')}
                  className="rounded bg-primary-600 px-2 py-1 text-xs text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <option value="en">English</option>
                  <option value="hi">हिंदी</option>
                  <option value="te">తెలుగు</option>
                </select>
                <button onClick={toggleChat} className="rounded-full p-1 hover:bg-primary-400">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        message.sender === 'user'
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <div className="mt-1 flex items-center justify-end space-x-2">
                        <button
                          onClick={() => speakMessage(message.text, message.language || 'en')}
                          className="opacity-70 hover:opacity-100"
                        >
                          {isSpeaking ? <VolumeX size={14} /> : <Volume2 size={14} />}
                        </button>
                        <span className="text-xs opacity-70">
                          {message.timestamp.toLocaleTimeString([], { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Chat Input */}
            <div className="border-t border-gray-200 bg-white p-3">
              <div className="flex items-center rounded-full border border-gray-300 bg-gray-50 px-3 py-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Type or speak in ${languageConfig[selectedLanguage].label}...`}
                  className="flex-1 bg-transparent text-sm focus:outline-none"
                />
                <button
                  onClick={handleVoiceInput}
                  className={`ml-2 rounded-full p-1.5 ${
                    isListening ? 'bg-primary-100 text-primary-500' : 'text-gray-400 hover:text-primary-500'
                  }`}
                >
                  {isListening ? <SpeechWave isActive={true} /> : <Mic size={18} />}
                </button>
                <button
                  onClick={sendMessage}
                  disabled={input.trim() === ''}
                  className="ml-2 rounded-full p-1.5 text-gray-400 hover:text-primary-500 disabled:opacity-50"
                >
                  <Send size={18} />
                </button>
              </div>
              <div className="mt-2 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Globe size={12} />
                <span>Multilingual Support</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChatbotWidget;