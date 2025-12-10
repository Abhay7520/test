import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Navigation, Share2, CheckCircle, UserPlus, RefreshCw, AlertTriangle, Signal } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface Contact {
  id: string;
  name: string;
  phone: string;
  email: string;
  relation: string;
}

const LocationShare = () => {
  const { t } = useLanguage();
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [shared, setShared] = useState(false);
  const [showAddContactDialog, setShowAddContactDialog] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({ name: "", phone: "", relation: "" });
  const [watchId, setWatchId] = useState<number | null>(null);

  useEffect(() => {
    const savedContacts = localStorage.getItem("emergencyContacts");
    if (savedContacts) {
      setContacts(JSON.parse(savedContacts));
    }

    startLocationWatch();

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  const startLocationWatch = () => {
    setLoading(true);

    if ("geolocation" in navigator) {
      // Clear existing watch if any
      if (watchId) navigator.geolocation.clearWatch(watchId);

      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;

          // Only update if we don't have a location yet, or if the new accuracy is better,
          // or if it's been a while (to track movement). 
          // For now, we update always to show the user what's happening, but we warn them.
          setLocation({ lat: latitude, lng: longitude });
          setAccuracy(accuracy);
          setLoading(false);

          if (accuracy <= 50) {
            // Good accuracy
          }
        },
        (error) => {
          console.error("Location error:", error);
          setLoading(false);
          if (error.code === 1) {
            toast.error("Location permission denied", {
              description: "Please enable location access in your browser/device settings.",
            });
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 30000,
          maximumAge: 0
        }
      );
      setWatchId(id);
    } else {
      setLoading(false);
      toast.error("Geolocation not supported");
    }
  };

  const forceRefreshLocation = () => {
    setLoading(true);
    setLocation(null); // Clear current to show we are searching
    setAccuracy(null);

    // Restart the watch
    startLocationWatch();
  };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      toast.error("Name and phone are required");
      return;
    }

    const contact: Contact = {
      id: Date.now().toString(),
      name: newContact.name,
      phone: newContact.phone,
      email: "",
      relation: newContact.relation,
    };

    const updatedContacts = [...contacts, contact];
    setContacts(updatedContacts);
    localStorage.setItem("emergencyContacts", JSON.stringify(updatedContacts));

    setNewContact({ name: "", phone: "", relation: "" });
    setShowAddContactDialog(false);
    toast.success("Contact added successfully");

    setTimeout(() => shareWithContacts(updatedContacts), 500);
  };

  const shareWithContacts = async (currentContacts: Contact[]) => {
    if (!location) return;

    setShared(true);
    const mapsUrl = `https://www.google.com/maps?q=${location.lat},${location.lng}`;
    const message = `🚨 EMERGENCY: I need help! My current location (Accuracy: ${accuracy?.toFixed(0)}m): ${mapsUrl}`;

    let successCount = 0;

    for (const contact of currentContacts) {
      const cleanPhone = contact.phone.replace(/[^\d+]/g, '');
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
      const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(message)}`;

      try {
        window.open(whatsappUrl, '_blank');
        await new Promise(resolve => setTimeout(resolve, 1000));
        window.open(smsUrl, '_blank');
        successCount++;
      } catch (e) {
        console.error(e);
      }
    }

    if (successCount > 0) {
      toast.success(`Shared with ${successCount} contacts`);
    }
  };

  const handleShareClick = () => {
    if (!location) return;

    if (contacts.length === 0) {
      setShowAddContactDialog(true);
      toast.info(t.noContacts || "No emergency contacts found", {
        description: t.addContactDesc,
      });
    } else {
      shareWithContacts(contacts);
    }
  };

  const getAccuracyColor = (acc: number) => {
    if (acc <= 50) return "text-success";
    if (acc <= 200) return "text-warning";
    return "text-destructive";
  };

  const getAccuracyText = (acc: number) => {
    if (acc <= 50) return "Excellent (GPS)";
    if (acc <= 200) return "Good";
    return "Poor (Likely Network/IP)";
  };

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-info-light flex items-center justify-center">
              <MapPin className="h-6 w-6 text-info" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{t.shareLocation}</h2>
              <p className="text-sm text-muted-foreground">
                {t.liveGps}
              </p>
            </div>
          </div>

          {location ? (
            <div className="space-y-4">
              <Card className={`p-4 border ${accuracy && accuracy > 200 ? 'bg-destructive/10 border-destructive/20' : 'bg-success-light border-success/20'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className={`h-5 w-5 flex-shrink-0 mt-0.5 ${accuracy ? getAccuracyColor(accuracy) : 'text-success'}`} />
                    <div className="flex-1 space-y-1">
                      <p className={`font-medium ${accuracy ? getAccuracyColor(accuracy) : 'text-success'}`}>
                        {accuracy && accuracy > 200 ? t.approximateLocation : t.locationAcquired}
                      </p>
                      <p className="text-sm opacity-80">
                        Lat: {location.lat.toFixed(6)}, Lng: {location.lng.toFixed(6)}
                      </p>
                      {accuracy && (
                        <div className="flex items-center gap-2 mt-1">
                          <Signal className="h-3 w-3" />
                          <p className={`text-xs font-medium ${getAccuracyColor(accuracy)}`}>
                            Accuracy: +/- {accuracy.toFixed(0)}m ({getAccuracyText(accuracy)})
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <Button size="sm" variant="ghost" onClick={forceRefreshLocation} disabled={loading} className="hover:bg-background/50">
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>

                {accuracy && accuracy > 200 && (
                  <div className="mt-3 pt-3 border-t border-destructive/20 text-sm text-destructive flex gap-2">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <p>
                      <strong>Warning:</strong> Location is not accurate ({accuracy.toFixed(0)}m).
                      This usually happens when GPS is disabled or unavailable.
                      {t.ensureGps}
                    </p>
                  </div>
                )}
              </Card>

              <div className="aspect-video rounded-lg overflow-hidden border-2 border-border relative">
                <iframe
                  src={`https://www.google.com/maps?q=${location.lat},${location.lng}&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                {loading && (
                  <div className="absolute inset-0 bg-background/50 flex items-center justify-center backdrop-blur-sm">
                    <div className="bg-background p-3 rounded-full shadow-lg flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span className="text-sm font-medium">{t.refiningLocation}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleShareClick}
                  disabled={shared}
                  className="flex-1 bg-emergency hover:bg-emergency-hover text-emergency-foreground"
                  size="lg"
                >
                  <Share2 className="h-5 w-5 mr-2" />
                  {shared ? t.locationSharedSuccess : t.shareWithContactsAction}
                </Button>
              </div>

              {shared && (
                <Card className="p-4 bg-info-light border-info/20">
                  <p className="text-sm text-info">
                    <strong>Shared with:</strong> {contacts.length} contact{contacts.length !== 1 ? 's' : ''} (via SMS & WhatsApp)
                  </p>
                </Card>
              )}
            </div>
          ) : (
            <div className="py-12 text-center space-y-4">
              <Navigation className="h-16 w-16 text-muted-foreground mx-auto animate-pulse" />
              <div>
                <p className="font-medium">{t.acquiringLocation}</p>
                <p className="text-sm text-muted-foreground">
                  {t.ensureGps}
                </p>
              </div>
              {!loading && (
                <div className="flex gap-2 justify-center">
                  <Button onClick={forceRefreshLocation} variant="outline">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    {t.retryLocation}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-4 bg-warning-light border-warning/20">
        <p className="text-sm text-warning">
          <strong>{t.privacyNote}:</strong> {t.privacyNoteDesc}
        </p>
      </Card>

      <Dialog open={showAddContactDialog} onOpenChange={setShowAddContactDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.addEmergencyContact}</DialogTitle>
            <DialogDescription>
              {t.addContactDesc}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.fullName || "Name"}</Label>
              <Input
                id="name"
                placeholder="e.g. John Doe"
                value={newContact.name}
                onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">{t.phoneNumber || "Phone Number"}</Label>
              <Input
                id="phone"
                placeholder="e.g. +91 98765 43210"
                value={newContact.phone}
                onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relation">{t.relation || "Relation"} (Optional)</Label>
              <Input
                id="relation"
                placeholder="e.g. Father"
                value={newContact.relation}
                onChange={(e) => setNewContact({ ...newContact, relation: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddContactDialog(false)}>{t.cancel}</Button>
            <Button onClick={handleAddContact} className="bg-emergency hover:bg-emergency-hover text-emergency-foreground">
              <UserPlus className="h-4 w-4 mr-2" />
              {t.addAndShare}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LocationShare;
