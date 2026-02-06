import { useState, useEffect } from "react";
import { User, Mail, Phone, MapPin, Save, Shield, Heart, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const ProfileTab = () => {
    const { t } = useLanguage();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [profile, setProfile] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        gender: "male",
        dob: "",
        bloodGroup: "",
        height: "",
        weight: "",
        address: ""
    });

    const [contacts, setContacts] = useState<any[]>([]);
    const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });

    useEffect(() => {
        if (user) {
            fetchProfile();
            fetchContacts();
        }
    }, [user]);

    const fetchContacts = async () => {
        if (!user?.id) return;
        const { data } = await supabase.from('emergency_contacts').select('*').eq('user_id', user.id);
        if (data) setContacts(data);
    };

    const handleAddContact = async () => {
        if (!newContact.name || !newContact.phone) return;
        const { error } = await supabase.from('emergency_contacts').insert({
            user_id: user?.id,
            name: newContact.name,
            phone: newContact.phone,
            relation: newContact.relation
        });
        if (error) {
            toast.error("Failed to add contact");
        } else {
            toast.success("Contact added");
            setNewContact({ name: "", phone: "", relation: "" });
            fetchContacts();
        }
    };

    const handleDeleteContact = async (id: string) => {
        const { error } = await supabase.from('emergency_contacts').delete().eq('id', id);
        if (error) {
            toast.error("Failed to delete contact");
        } else {
            toast.success("Contact deleted");
            fetchContacts();
        }
    };

    const fetchProfile = async () => {
        if (!user?.id) return;

        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data) {
                const nameParts = (data.full_name || "").split(" ");
                const firstName = nameParts[0] || "";
                const lastName = nameParts.slice(1).join(" ") || "";

                setProfile({
                    firstName,
                    lastName,
                    email: user.email || "",
                    phone: data.phone || "",
                    gender: data.gender || "male",
                    dob: data.dob || "",
                    bloodGroup: data.blood_group || "",
                    height: data.height || "",
                    weight: data.weight || "",
                    address: data.address || ""
                });
            }
        } catch (error) {
            console.error("Error fetching profile:", error);
            // toast.error("Failed to load profile");
        }
    };

    const handleSave = async () => {
        if (!user?.id) return;
        setLoading(true);

        try {
            const fullName = `${profile.firstName} ${profile.lastName}`.trim();

            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    phone: profile.phone,
                    gender: profile.gender,
                    dob: profile.dob || null,
                    blood_group: profile.bloodGroup,
                    height: profile.height,
                    weight: profile.weight,
                    address: profile.address,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

            if (error) throw error;
            toast.success(t.profileUpdated);
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">{t.profileSettings}</h2>
                <Button onClick={handleSave} disabled={loading} className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 shadow-lg shadow-teal-500/20 rounded-xl transition-all duration-300">
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : t.saveChanges}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Picture Card */}
                <Card className="md:col-span-1 border-white/20 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg rounded-2xl overflow-hidden">
                    <CardContent className="pt-8 flex flex-col items-center text-center relative z-10">
                        <div className="w-40 h-40 rounded-full p-1 bg-gradient-to-br from-teal-500 via-cyan-500 to-blue-500 shadow-xl mb-6 relative group">
                            <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center overflow-hidden relative">
                                <User className="w-20 h-20 text-slate-300 dark:text-slate-600" />
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer backdrop-blur-[2px]">
                                    <span className="text-white text-xs font-bold uppercase tracking-wider">{t.changePhoto}</span>
                                </div>
                            </div>
                        </div>
                        <h3 className="font-bold text-2xl text-slate-800 dark:text-white mb-1">{profile.firstName || "User"} {profile.lastName}</h3>
                        <p className="text-teal-600 dark:text-teal-400 font-medium mb-6">{profile.email}</p>

                        <div className="w-full space-y-3 bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-200/50 dark:border-slate-700/50">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-slate-500 dark:text-slate-400 font-medium">{t.profileCompletion}</span>
                                <span className="font-bold text-teal-600 dark:text-teal-400">85%</span>
                            </div>
                            <div className="h-2.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 w-[85%] rounded-full shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Details Form */}
                <Card className="md:col-span-2 border-white/20 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg rounded-2xl">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                <User className="w-5 h-5" />
                            </div>
                            {t.personalInformation}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-5 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-slate-600 dark:text-slate-300">{t.firstName}</Label>
                                <Input
                                    id="firstName"
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-slate-600 dark:text-slate-300">{t.lastName}</Label>
                                <Input
                                    id="lastName"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-slate-600 dark:text-slate-300">{t.emailAddress}</Label>
                                <div className="relative group">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    <Input
                                        id="email"
                                        className="pl-10 bg-slate-100/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 text-slate-500 rounded-xl"
                                        value={profile.email}
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-slate-600 dark:text-slate-300">{t.phoneNumber}</Label>
                                <div className="relative group">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                    <Input
                                        id="phone"
                                        className="pl-10 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender" className="text-slate-600 dark:text-slate-300">{t.gender}</Label>
                                <Select
                                    value={profile.gender}
                                    onValueChange={(val) => setProfile({ ...profile, gender: val })}
                                >
                                    <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-teal-500/20 rounded-xl">
                                        <SelectValue placeholder={t.selectGender} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">{t.male}</SelectItem>
                                        <SelectItem value="female">{t.female}</SelectItem>
                                        <SelectItem value="other">{t.other}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="dob" className="text-slate-600 dark:text-slate-300">{t.dob}</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={profile.dob}
                                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address" className="text-slate-600 dark:text-slate-300">{t.address}</Label>
                            <div className="relative group">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
                                <Input
                                    id="address"
                                    className="pl-10 bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl"
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical ID Card */}
                <Card className="md:col-span-3 border-white/20 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg rounded-2xl">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400">
                                <Heart className="w-5 h-5" />
                            </div>
                            {t.medicalId}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="bloodGroup" className="text-slate-600 dark:text-slate-300">{t.bloodGroup}</Label>
                                <Select
                                    value={profile.bloodGroup}
                                    onValueChange={(val) => setProfile({ ...profile, bloodGroup: val })}
                                >
                                    <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:ring-teal-500/20 rounded-xl">
                                        <SelectValue placeholder={t.select} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="A+">A+</SelectItem>
                                        <SelectItem value="A-">A-</SelectItem>
                                        <SelectItem value="B+">B+</SelectItem>
                                        <SelectItem value="B-">B-</SelectItem>
                                        <SelectItem value="O+">O+</SelectItem>
                                        <SelectItem value="O-">O-</SelectItem>
                                        <SelectItem value="AB+">AB+</SelectItem>
                                        <SelectItem value="AB-">AB-</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height" className="text-slate-600 dark:text-slate-300">{t.height} (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={profile.height}
                                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight" className="text-slate-600 dark:text-slate-300">{t.weight} (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={profile.weight}
                                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                    className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-700 focus:border-teal-500 focus:ring-teal-500/20 rounded-xl"
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contacts Card */}
                <Card className="md:col-span-3 border-white/20 dark:border-slate-700/50 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl shadow-lg rounded-2xl">
                    <CardHeader className="border-b border-slate-100 dark:border-slate-700/50 pb-4">
                        <CardTitle className="text-xl flex items-center gap-2">
                            <div className="p-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                                <Shield className="w-5 h-5" />
                            </div>
                            {t.emergencyContacts || "Emergency Contacts"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-700">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Name</Label>
                                <Input
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    placeholder="Contact Name"
                                    className="bg-white dark:bg-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Phone</Label>
                                <Input
                                    value={newContact.phone}
                                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                    placeholder="Phone Number"
                                    className="bg-white dark:bg-slate-900"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Relation</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newContact.relation}
                                        onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                                        placeholder="Relationship"
                                        className="bg-white dark:bg-slate-900"
                                    />
                                    <Button onClick={handleAddContact} size="icon" className="shrink-0 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-md shadow-indigo-500/20">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-bold text-sm text-slate-500 uppercase tracking-wider">Saved Contacts</h4>
                            {contacts.length === 0 ? (
                                <p className="text-sm text-slate-400 italic">No emergency contacts added yet.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {contacts.map((contact) => (
                                        <div key={contact.id} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-700/50 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-white hover:shadow-md transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold">
                                                    {contact.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-slate-800 dark:text-slate-200">{contact.name}</p>
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">{contact.relation} • {contact.phone}</p>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)} className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
