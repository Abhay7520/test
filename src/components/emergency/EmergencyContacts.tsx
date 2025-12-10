import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Mail, MessageSquare, Send, UserPlus, Trash2, User, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relation: string;
}

interface MedicalInfo {
  userName: string;
  bloodGroup: string;
  allergies: string;
  conditions: string;
  medications: string;
}

const EmergencyContacts = () => {
  const { emergencyContacts, updateEmergencyContacts } = useAuth();

  const [medicalInfo, setMedicalInfo] = useState<MedicalInfo>(() => {
    const saved = localStorage.getItem("medicalInfo");
    return saved ? JSON.parse(saved) : {
      userName: "",
      bloodGroup: "",
      allergies: "",
      conditions: "",
      medications: "",
    };
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [showMedicalForm, setShowMedicalForm] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    relation: "",
  });
  const [isNotifying, setIsNotifying] = useState(false);

  useEffect(() => {
    localStorage.setItem("medicalInfo", JSON.stringify(medicalInfo));
  }, [medicalInfo]);

  const notifyContacts = async () => {
    if (emergencyContacts.length === 0) {
      toast.error("No emergency contacts", {
        description: "Please add at least one contact first.",
      });
      return;
    }

    if (!medicalInfo.userName) {
      toast.error("Medical information incomplete", {
        description: "Please add your name in medical information.",
      });
      setShowMedicalForm(true);
      return;
    }

    setIsNotifying(true);

    // Get accurate GPS location
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const mapsLink = `https://www.google.com/maps?q=${latitude},${longitude}`;
          const timestamp = new Date().toLocaleString();

          // Format emergency message
          const message = `🚨 EMERGENCY ALERT 🚨

${medicalInfo.userName} has triggered an emergency alert!

📍 Location: ${mapsLink}
🕐 Time: ${timestamp}

🩺 Medical Information:
${medicalInfo.bloodGroup ? `Blood Group: ${medicalInfo.bloodGroup}` : ''}
${medicalInfo.allergies ? `Allergies: ${medicalInfo.allergies}` : 'Allergies: None reported'}
${medicalInfo.conditions ? `Medical Conditions: ${medicalInfo.conditions}` : 'Medical Conditions: None reported'}
${medicalInfo.medications ? `Current Medications: ${medicalInfo.medications}` : ''}

⚠️ This is an automated emergency notification. Please respond immediately.`;

          // Clean phone numbers (remove spaces and special chars except +)
          const cleanPhone = (phone: string) => phone.replace(/[^\d+]/g, '');

          // Send to each contact
          let successCount = 0;
          for (const contact of emergencyContacts) {
            const phoneNumber = cleanPhone(contact.phone);

            // WhatsApp (opens WhatsApp with pre-filled message)
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

            // SMS (opens SMS app with pre-filled message)
            const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;

            // Open both in new tabs/windows
            try {
              // For mobile, we'll open WhatsApp first
              window.open(whatsappUrl, '_blank');

              // Small delay before opening SMS
              await new Promise(resolve => setTimeout(resolve, 1000));
              window.open(smsUrl, '_blank');

              successCount++;
            } catch (error) {
              console.error(`Failed to notify ${contact.name}:`, error);
            }
          }

          setIsNotifying(false);

          if (successCount > 0) {
            toast.success(`Opening ${successCount} notification window(s)`, {
              description: "WhatsApp and SMS apps will open with pre-filled emergency messages. Please send them.",
            });
          } else {
            toast.error("Failed to open notification apps", {
              description: "Please check your browser settings.",
            });
          }
        },
        (error) => {
          setIsNotifying(false);
          toast.error("Location access denied", {
            description: "Unable to get your location. Please enable location services.",
          });
          console.error("Geolocation error:", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setIsNotifying(false);
      toast.error("Geolocation not supported", {
        description: "Your device doesn't support location services.",
      });
    }
  };

  const addContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Please fill required fields", {
        description: "Name and phone number are required.",
      });
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      ...newContact,
    };

    updateEmergencyContacts([...emergencyContacts, contact]);
    setNewContact({ name: "", phone: "", email: "", relation: "" });
    setShowAddForm(false);
    toast.success("Contact added successfully");
  };

  const deleteContact = (id: string) => {
    updateEmergencyContacts(emergencyContacts.filter((c) => c.id !== id));
    toast.success("Contact removed");
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-warning-light flex items-center justify-center">
                <Users className="h-6 w-6 text-warning" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Emergency Contacts</h2>
                <p className="text-sm text-muted-foreground">
                  {emergencyContacts.length} contact{emergencyContacts.length !== 1 ? "s" : ""} configured
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => setShowMedicalForm(!showMedicalForm)} variant="outline">
                <User className="h-4 w-4 mr-2" />
                Medical Info
              </Button>
              <Button onClick={() => setShowAddForm(!showAddForm)} variant="outline">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Contact
              </Button>
            </div>
          </div>

          {/* Medical Information Form */}
          {showMedicalForm && (
            <Card className="p-4 bg-info-light border-info/20">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <User className="h-5 w-5 text-info" />
                  <h3 className="font-semibold text-info">Your Medical Information</h3>
                </div>
                <p className="text-sm text-info/90">
                  This information will be shared with emergency contacts when you trigger an alert.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="userName" className="text-info">Your Name *</Label>
                    <Input
                      id="userName"
                      placeholder="Your full name"
                      value={medicalInfo.userName}
                      onChange={(e) =>
                        setMedicalInfo({ ...medicalInfo, userName: e.target.value })
                      }
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bloodGroup" className="text-info">Blood Group</Label>
                    <Input
                      id="bloodGroup"
                      placeholder="e.g., O+, A-, B+, AB+"
                      value={medicalInfo.bloodGroup}
                      onChange={(e) =>
                        setMedicalInfo({ ...medicalInfo, bloodGroup: e.target.value })
                      }
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="allergies" className="text-info">Allergies</Label>
                    <Input
                      id="allergies"
                      placeholder="e.g., Penicillin, Peanuts, None"
                      value={medicalInfo.allergies}
                      onChange={(e) =>
                        setMedicalInfo({ ...medicalInfo, allergies: e.target.value })
                      }
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="conditions" className="text-info">Medical Conditions</Label>
                    <Textarea
                      id="conditions"
                      placeholder="e.g., Diabetes, Hypertension, Asthma"
                      value={medicalInfo.conditions}
                      onChange={(e) =>
                        setMedicalInfo({ ...medicalInfo, conditions: e.target.value })
                      }
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="medications" className="text-info">Current Medications</Label>
                    <Textarea
                      id="medications"
                      placeholder="e.g., Aspirin 100mg daily, Lisinopril 10mg"
                      value={medicalInfo.medications}
                      onChange={(e) =>
                        setMedicalInfo({ ...medicalInfo, medications: e.target.value })
                      }
                      className="bg-background"
                    />
                  </div>
                </div>
                <Button
                  onClick={() => {
                    setShowMedicalForm(false);
                    toast.success("Medical information saved");
                  }}
                  className="w-full"
                >
                  Save Medical Information
                </Button>
              </div>
            </Card>
          )}

          {/* Add Contact Form */}
          {showAddForm && (
            <Card className="p-4 bg-muted/50">
              <div className="space-y-4">
                <h3 className="font-semibold">Add New Contact</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      placeholder="Contact name"
                      value={newContact.name}
                      onChange={(e) =>
                        setNewContact({ ...newContact, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone *</Label>
                    <Input
                      id="phone"
                      placeholder="+91 XXXXXXXXXX"
                      value={newContact.phone}
                      onChange={(e) =>
                        setNewContact({ ...newContact, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={newContact.email}
                      onChange={(e) =>
                        setNewContact({ ...newContact, email: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relation">Relation</Label>
                    <Input
                      id="relation"
                      placeholder="Father, Mother, Spouse, etc."
                      value={newContact.relation}
                      onChange={(e) =>
                        setNewContact({ ...newContact, relation: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={addContact} className="flex-1">
                    Add Contact
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline">
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {/* Contacts List */}
          <div className="space-y-3">
            {emergencyContacts.map((contact) => (
              <Card key={contact.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{contact.name}</h3>
                      {contact.relation && (
                        <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                          {contact.relation}
                        </span>
                      )}
                    </div>
                    <div className="space-y-0.5 text-sm text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <MessageSquare className="h-3 w-3" />
                        {contact.phone}
                      </p>
                      {contact.email && (
                        <p className="flex items-center gap-2">
                          <Mail className="h-3 w-3" />
                          {contact.email}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteContact(contact.id)}
                    variant="ghost"
                    size="sm"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* Warning if medical info incomplete */}
          {!medicalInfo.userName && (
            <Card className="p-4 bg-warning-light border-warning/20">
              <div className="flex gap-3">
                <AlertCircle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium text-warning">Action Required</p>
                  <p className="text-sm text-warning/90">
                    Please add your medical information before notifying contacts. Click "Medical Info" above.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Notify Button */}
          <Button
            onClick={notifyContacts}
            disabled={emergencyContacts.length === 0 || isNotifying}
            className="w-full bg-emergency hover:bg-emergency-hover text-emergency-foreground"
            size="lg"
          >
            <Send className="h-5 w-5 mr-2" />
            {isNotifying ? "Getting Location..." : "Notify All Emergency Contacts"}
          </Button>
        </div>
      </Card>

      {/* Info Cards */}
      <Card className="p-4 bg-info-light border-info/20">
        <div className="space-y-2 text-sm">
          <p className="font-medium text-info">What they will receive via SMS & WhatsApp:</p>
          <ul className="list-disc list-inside text-info/90 space-y-1">
            <li>Your name and emergency alert notification</li>
            <li>Your current GPS location (accurate Google Maps link)</li>
            <li>Your medical information (blood group, allergies, conditions, medications)</li>
            <li>Timestamp of the emergency</li>
          </ul>
        </div>
      </Card>

      <Card className="p-4 bg-warning-light border-warning/20">
        <div className="space-y-2 text-sm">
          <p className="font-medium text-warning">📱 How it works:</p>
          <ul className="list-disc list-inside text-warning/90 space-y-1">
            <li>WhatsApp and SMS apps will open automatically</li>
            <li>Messages will be pre-filled with your emergency information</li>
            <li>You just need to press "Send" in each app</li>
            <li>Your accurate GPS location is included in real-time</li>
          </ul>
          <p className="text-warning font-medium mt-2">
            💡 Tip: Allow location access for accurate GPS coordinates
          </p>
        </div>
      </Card>
    </div>
  );
};

export default EmergencyContacts;