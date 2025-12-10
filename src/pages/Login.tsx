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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4 relative">
            <div className="absolute top-4 right-4">
                <LanguageSelector />
            </div>
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Heart className="w-8 h-8 text-primary fill-current" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">{t.appName}</h1>
                    <p className="text-muted-foreground mt-2">Your Personal Health Companion</p>
                </div>

                <Card className="border-none shadow-xl relative">
                    {/* Back Button */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="absolute left-2 top-2"
                        onClick={() => {
                            if (step === 2) setStep(1);
                            else navigate("/");
                        }}
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </Button>

                    <CardHeader className="pt-10">
                        <CardTitle className="text-xl">
                            {step === 1 ? (isLogin ? "Login" : "Create Account") : t.emergencySafety}
                        </CardTitle>
                        <CardDescription>
                            {step === 1
                                ? (isLogin ? "Welcome back! Please login to continue." : "Sign up to get started.")
                                : t.emergencySafetyDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {step === 1 ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                {!isLogin && (
                                    <>
                                        <div className="space-y-2">
                                            <Label htmlFor="name">{t.fullName}</Label>
                                            <Input
                                                id="name"
                                                placeholder="John Doe"
                                                value={userData.name}
                                                onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                                onFocus={() => speakText(t.fullName)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="phone">{t.phoneNumber}</Label>
                                            <Input
                                                id="phone"
                                                type="tel"
                                                placeholder="+91 98765 43210"
                                                value={userData.phone}
                                                onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                                                onFocus={() => speakText(t.phoneNumber)}
                                            />
                                        </div>
                                    </>
                                )}
                                <div className="space-y-2">
                                    <Label htmlFor="email">{t.emailAddress}</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="john@example.com"
                                        value={userData.email}
                                        onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                        onFocus={() => speakText(t.emailAddress)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">{t.password}</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={userData.password}
                                        onChange={(e) => setUserData({ ...userData, password: e.target.value })}
                                        onFocus={() => speakText(t.password)}
                                    />
                                </div>

                                {showResend && (
                                    <Button
                                        variant="link"
                                        className="px-0 text-sm text-destructive"
                                        onClick={handleResendVerification}
                                    >
                                        {t.resendVerification}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-3 text-sm text-amber-800 mb-4">
                                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                                    <p>{t.safetyNote}</p>
                                </div>

                                {/* Added Contacts List */}
                                {contacts.length > 0 && (
                                    <div className="space-y-2 mb-4">
                                        <Label>{t.addedContacts}</Label>
                                        <div className="space-y-2">
                                            {contacts.map(contact => (
                                                <div key={contact.id} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                                                    <div>
                                                        <span className="font-medium">{contact.name}</span>
                                                        <span className="text-muted-foreground ml-2">({contact.relation})</span>
                                                    </div>
                                                    <Button variant="ghost" size="sm" onClick={() => removeContact(contact.id)}>
                                                        <Trash2 className="w-4 h-4 text-destructive" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="c-name">{t.contactName}</Label>
                                    <Input
                                        id="c-name"
                                        placeholder="Jane Doe"
                                        value={currentContact.name}
                                        onChange={(e) => setCurrentContact({ ...currentContact, name: e.target.value })}
                                        onFocus={() => speakText(t.contactName)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-relation">{t.relation}</Label>
                                    <Input
                                        id="c-relation"
                                        placeholder="Mother, Spouse, etc."
                                        value={currentContact.relation}
                                        onChange={(e) => setCurrentContact({ ...currentContact, relation: e.target.value })}
                                        onFocus={() => speakText(t.relation)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="c-phone">{t.phoneNumber}</Label>
                                    <Input
                                        id="c-phone"
                                        type="tel"
                                        placeholder="+91 98765 43210"
                                        value={currentContact.phone}
                                        onChange={(e) => setCurrentContact({ ...currentContact, phone: e.target.value })}
                                        onFocus={() => speakText(t.phoneNumber)}
                                    />
                                </div>

                                <Button variant="outline" size="sm" className="w-full" onClick={handleAddContact}>
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t.addAnotherContact}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                    <CardFooter className="flex flex-col gap-4">
                        {step === 1 ? (
                            <>
                                <Button className="w-full" onClick={handleAuthAction}>
                                    {isLogin ? "Login" : "Continue"} <ArrowRight className="w-4 h-4 ml-2" />
                                </Button>
                                <div className="text-center text-sm">
                                    <span className="text-muted-foreground">
                                        {isLogin ? "Don't have an account? " : "Already have an account? "}
                                    </span>
                                    <button
                                        className="text-primary font-semibold hover:underline"
                                        onClick={() => setIsLogin(!isLogin)}
                                    >
                                        {isLogin ? "Sign Up" : "Login"}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <Button className="w-full bg-teal-600 hover:bg-teal-700" onClick={handleComplete}>
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
