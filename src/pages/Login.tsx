import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Heart, ArrowRight, UserPlus, ShieldCheck, ArrowLeft, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageSelector } from "@/components/common/LanguageSelector";
import LoadingScreen from "@/components/auralaid/ui/LoadingScreen";

interface Contact {
    id: string;
    name: string;
    phone: string;
    email: string;
    relation: string;
}

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const { t, language } = useLanguage();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [isLogin, setIsLogin] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Form State
    const [userData, setUserData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
    });

    const [contacts, setContacts] = useState<Contact[]>([]);
    const [currentContact, setCurrentContact] = useState({
        name: "",
        phone: "",
        relation: "",
        email: "",
    });

    const [showResend, setShowResend] = useState(false);

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop previous speech
            const utterance = new SpeechSynthesisUtterance(text);
            // Map language codes to speech synthesis locales
            const langMap: { [key: string]: string } = {
                'en': 'en-US',
                'hi': 'hi-IN',
                'te': 'te-IN'
            };
            utterance.lang = langMap[language] || 'en-US';
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleResendVerification = async () => {
        if (!userData.email) return;

        try {
            const { error } = await supabase.auth.resend({
                type: 'signup',
                email: userData.email,
            });

            if (error) throw error;

            toast.success(t.verificationSent);
            speakText(t.verificationSent);
        } catch (error: any) {
            console.error("Resend error:", error);
            toast.error(error.message);
            speakText(error.message);
        }
    };

    const handleAddContact = () => {
        if (!currentContact.name || !currentContact.phone || !currentContact.relation) {
            toast.error("Please fill required contact details");
            speakText("Please fill required contact details");
            return;
        }

        const newContact: Contact = {
            id: Date.now().toString(),
            ...currentContact,
        };

        setContacts([...contacts, newContact]);
        setCurrentContact({ name: "", phone: "", relation: "", email: "" });
        toast.success("Contact added");
        speakText("Contact added");
    };

    const removeContact = (id: string) => {
        setContacts(contacts.filter(c => c.id !== id));
    };

    const handleAuthAction = async () => {
        if (!userData.email || !userData.password) {
            const msg = "Please enter email and password";
            toast.error(msg);
            speakText(msg);
            return;
        }

        if (isLogin) {
            setIsLoading(true);
            setShowResend(false);
            try {
                const { error } = await supabase.auth.signInWithPassword({
                    email: userData.email,
                    password: userData.password,
                });

                if (error) {
                    console.error("Supabase Login Error:", error);
                    if (error.message.includes("Email not confirmed")) {
                        toast.error(t.emailNotVerified);
                        toast.info(t.checkInbox);
                        speakText(t.emailNotVerified + ". " + t.checkInbox);
                        setShowResend(true);
                    } else {
                        toast.error(error.message);
                        speakText(error.message);
                    }
                } else {
                    toast.success(t.welcomeBack);
                    speakText(t.welcomeBack);
                    const from = (location.state as any)?.from?.pathname || "/dashboard";
                    navigate(from, { replace: true });
                }
            } catch (error: any) {
                console.error("Unexpected Login Error:", error);
                toast.error("Login failed");
                speakText("Login failed");
            } finally {
                setIsLoading(false);
            }
        } else {
            // Signup flow - check required fields for signup
            if (!userData.name || !userData.phone) {
                const msg = "Please enter name and phone number for signup";
                toast.error(msg);
                speakText(msg);
                return;
            }
            // Proceed to emergency contacts step
            setStep(2);
            speakText(t.emergencySafetyDesc);
        }
    };

    const handleComplete = async () => {
        // If they have typed something in the form but not added it, try to add it
        let finalContacts = [...contacts];
        if (currentContact.name && currentContact.phone && currentContact.relation) {
            const newContact: Contact = {
                id: Date.now().toString(),
                ...currentContact,
            };
            finalContacts.push(newContact);
        }

        if (finalContacts.length === 0) {
            const msg = "Please add at least one emergency contact";
            toast.error(msg);
            speakText(msg);
            return;
        }

        setIsLoading(true);
        try {
            // 1. Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        full_name: userData.name,
                        phone: userData.phone,
                    },
                },
            });

            if (authError) throw authError;

            if (authData.user) {
                // 1.5 Insert/Update Profile
                const { error: profileError } = await supabase
                    .from('profiles')
                    .upsert({
                        id: authData.user.id,
                        full_name: userData.name,
                        phone: userData.phone,
                        updated_at: new Date().toISOString(),
                    });

                if (profileError) console.error("Error saving profile:", profileError);

                // 2. Insert Emergency Contacts
                if (finalContacts.length > 0) {
                    const contactsToInsert = finalContacts.map(c => ({
                        user_id: authData.user!.id,
                        name: c.name,
                        phone: c.phone,
                        relation: c.relation,
                        email: c.email
                    }));

                    const { error: contactsError } = await supabase
                        .from('emergency_contacts')
                        .insert(contactsToInsert);

                    if (contactsError) console.error("Error saving contacts:", contactsError);
                }

                toast.success("Welcome to SwasthAI!");
                speakText("Welcome to SwasthAI!");
                const from = (location.state as any)?.from?.pathname || "/dashboard";
                navigate(from, { replace: true });
            }
        } catch (error: any) {
            console.error("Signup error:", error);
            toast.error(error.message || "Signup failed");
            speakText(error.message || "Signup failed");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[10%] left-[10%] w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-float" />
                <div className="absolute bottom-[10%] right-[10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-float-delayed" />
            </div>

            <div className="absolute top-4 right-4 z-50">
                <LanguageSelector />
            </div>
            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 p-0.5 flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center">
                            <Heart className="w-10 h-10 text-teal-600 dark:text-teal-400 fill-current" />
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-400 dark:to-cyan-400 bg-clip-text text-transparent mb-2">{t.appName}</h1>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Your Personal Health Companion</p>
                </div>

                <Card className="border-white/20 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-4 top-4 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                        onClick={() => {
                            if (step === 2) setStep(1);
                            else navigate("/");
                        }}
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>

                    <CardHeader className="pt-12 pb-6 text-center">
                        <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">
                            {step === 1 ? (isLogin ? "Welcome Back" : "Create Account") : t.emergencySafety}
                        </CardTitle>
                        <CardDescription className="text-slate-500 dark:text-slate-400">
                            {step === 1
                                ? (isLogin ? "Please login to access your dashboard" : "Sign up to get started with your health journey")
                                : t.emergencySafetyDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === 1 ? (
                            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                                {!isLogin && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="text-slate-700 dark:text-slate-300">{t.fullName}</Label>
                                            <Input
                                                id="name"
                                                className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                                                placeholder="John Doe"
                                                value={userData.name}
                                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                                onFocus={() => speakText(t.fullName)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone" className="text-slate-700 dark:text-slate-300">{t.phoneNumber}</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                                                placeholder="+91 98765 43210"
                                                value={userData.phone}
                                                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                                onFocus={() => speakText(t.phoneNumber)}
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="text-slate-700 dark:text-slate-300">{t.emailAddress}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                                        placeholder="john@example.com"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        onFocus={() => speakText(t.emailAddress)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300">{t.password}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                                        placeholder="Enter your password"
                                        value={userData.password}
                                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                        onFocus={() => speakText(t.password)}
                                    />
                                </div>

                                {showResend && (
                                    <Button
                                        variant="link"
                                        className="px-0 text-sm text-rose-500"
                                        onClick={handleResendVerification}
                                    >
                                        {t.resendVerification}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 flex gap-3 text-sm text-amber-800 dark:text-amber-200 mb-4">
                                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                                    <p>{t.safetyNote}</p>
                                </div>

                                {/* Added Contacts List */}
                                {contacts.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        <Label className="text-slate-700 dark:text-slate-300">{t.addedContacts}</Label>
                                        <div className="space-y-2">
                                            {contacts.map(contact => (
                                                <div key={contact.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700 p-3 rounded-lg text-sm">
                                                    <div>
                                                        <span className="font-bold text-slate-800 dark:text-slate-200">{contact.name}</span>
                                                        <span className="text-slate-500 dark:text-slate-400 ml-2">({contact.relation})</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => removeContact(contact.id)} className="h-8 w-8 text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="c-name" className="text-slate-700 dark:text-slate-300">{t.contactName}</Label>
                                    <Input
                                        id="c-name"
                                        className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                                        placeholder="Jane Doe"
                                        value={currentContact.name}
                                        onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
                                        onFocus={() => speakText(t.contactName)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-relation" className="text-slate-700 dark:text-slate-300">{t.relation}</Label>
                                    <Input
                                        id="c-relation"
                                        className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                                        placeholder="Mother, Spouse, etc."
                                        value={currentContact.relation}
                                        onChange={(e) => setCurrentContact({ ...currentContact, relation: e.target.value })}
                                        onFocus={() => speakText(t.relation)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-phone" className="text-slate-700 dark:text-slate-300">{t.phoneNumber}</Label>
                                    <Input
                                        id="c-phone"
                                        type="tel"
                                        className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700"
                                        placeholder="+91 98765 43210"
                                        value={currentContact.phone}
                                        onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                                        onFocus={() => speakText(t.phoneNumber)}
                                    />
                                </div>

                                <Button variant="outline" size="sm" className="w-full border-dashed border-slate-300 dark:border-slate-600 hover:border-teal-500 hover:text-teal-600 dark:hover:text-teal-400" onClick={handleAddContact}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t.addAnotherContact}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4 pb-8">
                        {step === 1 ? (
                            <>
                                <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/20 text-white font-bold h-11" onClick={handleAuthAction}>
                                    {isLogin ? "Login" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <div className="text-center text-sm">
                                    <span className="text-slate-500 dark:text-slate-400">
                                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    </span>
                                    <button
                                        className="text-teal-600 dark:text-teal-400 font-bold hover:underline"
                                        onClick={() => setIsLogin(!isLogin)}
                                    >
                                        {isLogin ? "Sign Up" : "Login"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Button className="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/20 text-white font-bold h-11" onClick={handleComplete}>
                                {t.completeSetup} <UserPlus className="w-4 h-4 ml-2" />
                            </Button>
                        )}
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
};

export default Login;
