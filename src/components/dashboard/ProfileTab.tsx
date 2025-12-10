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
                    dob: profile.dob,
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
                <h2 className="text-2xl font-bold">{t.profileSettings}</h2>
                <Button onClick={handleSave} disabled={loading}>
                    <Save className="w-4 h-4 mr-2" />
                    {loading ? "Saving..." : t.saveChanges}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Picture Card */}
                <Card className="md:col-span-1">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative group cursor-pointer overflow-hidden">
                            <User className="w-16 h-16 text-primary" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white text-xs font-medium">{t.changePhoto}</span>
                            </div>
                        </div>
                        <h3 className="font-bold text-xl">{profile.firstName} {profile.lastName}</h3>
                        <p className="text-muted-foreground text-sm">{profile.email}</p>
                        <div className="mt-6 w-full space-y-2">
                            <div className="flex items-center justify-between text-sm p-3 bg-muted/50 rounded-lg">
                                <span className="text-muted-foreground">{t.profileCompletion}</span>
                                <span className="font-bold text-primary">85%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[85%]" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Personal Details Form */}
                <Card className="md:col-span-2">
                    <CardHeader>
                        <CardTitle>{t.personalInformation}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">{t.firstName}</Label>
                                <Input
                                    id="firstName"
                                    value={profile.firstName}
                                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">{t.lastName}</Label>
                                <Input
                                    id="lastName"
                                    value={profile.lastName}
                                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">{t.emailAddress}</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        className="pl-9"
                                        value={profile.email}
                                        disabled
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">{t.phoneNumber}</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        id="phone"
                                        className="pl-9"
                                        value={profile.phone}
                                        onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">{t.gender}</Label>
                                <Select
                                    value={profile.gender}
                                    onValueChange={(val) => setProfile({ ...profile, gender: val })}
                                >
                                    <SelectTrigger>
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
                                <Label htmlFor="dob">{t.dob}</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    value={profile.dob}
                                    onChange={(e) => setProfile({ ...profile, dob: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">{t.address}</Label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <Input
                                    id="address"
                                    className="pl-9"
                                    value={profile.address}
                                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Medical ID Card */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-rose-500" />
                            {t.medicalId}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="bloodGroup">{t.bloodGroup}</Label>
                                <Select
                                    value={profile.bloodGroup}
                                    onValueChange={(val) => setProfile({ ...profile, bloodGroup: val })}
                                >
                                    <SelectTrigger>
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
                                <Label htmlFor="height">{t.height}</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={profile.height}
                                    onChange={(e) => setProfile({ ...profile, height: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">{t.weight}</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={profile.weight}
                                    onChange={(e) => setProfile({ ...profile, weight: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Emergency Contacts Card */}
                <Card className="md:col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Shield className="w-5 h-5 text-blue-500" />
                            {t.emergencyContacts || "Emergency Contacts"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Name</Label>
                                <Input
                                    value={newContact.name}
                                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                                    placeholder="Contact Name"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Phone</Label>
                                <Input
                                    value={newContact.phone}
                                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                                    placeholder="Phone Number"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Relation</Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={newContact.relation}
                                        onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
                                        placeholder="Relation (e.g. Father)"
                                    />
                                    <Button onClick={handleAddContact} size="icon">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="font-medium text-sm text-muted-foreground">Saved Contacts</h4>
                            {contacts.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No emergency contacts added.</p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {contacts.map((contact) => (
                                        <div key={contact.id} className="flex items-center justify-between p-3 border rounded-lg bg-muted/50">
                                            <div>
                                                <p className="font-medium">{contact.name}</p>
                                                <p className="text-sm text-muted-foreground">{contact.relation} • {contact.phone}</p>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => handleDeleteContact(contact.id)}>
                                                <Trash2 className="w-4 h-4 text-red-500" />
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
