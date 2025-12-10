import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, ChevronRight, ChevronLeft, AlertCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FirstAidTopic {
  id: string;
  title: string;
  icon: string;
  steps: string[];
  warnings: string[];
}

const FirstAidGuide = () => {
  const { t } = useLanguage();
  const [selectedTopic, setSelectedTopic] = useState<FirstAidTopic | null>(null);

  const firstAidTopics: FirstAidTopic[] = useMemo(() => [
    {
      id: "bleeding",
      title: "Severe Bleeding", // Ideally these should also be in translations, but for now we keep English or use generic keys if available. 
      // Since I didn't add specific keys for topic content, I will leave them as English for now, 
      // but the UI elements around them will be translated.
      // To fully translate content, I would need keys for every step.
      icon: "🩸",
      steps: [
        "Apply direct pressure to the wound using a clean cloth",
        "Keep pressure for at least 5-10 minutes without checking",
        "If blood soaks through, add more cloth on top (don't remove the first layer)",
        "Elevate the injured area above the heart if possible",
        "Once bleeding slows, wrap firmly with a bandage",
        "Call for medical help if bleeding doesn't stop",
      ],
      warnings: [
        "Don't remove embedded objects from wounds",
        "Don't apply a tourniquet unless trained",
      ],
    },
    {
      id: "burns",
      title: "Burns",
      icon: "🔥",
      steps: [
        "Remove the person from the heat source immediately",
        "Cool the burn under cool (not cold) running water for 10-20 minutes",
        "Remove jewelry and tight clothing near the burn before swelling starts",
        "Cover with a sterile, non-stick bandage or clean cloth",
        "Don't apply ice, butter, or any creams",
        "For severe burns covering large areas, seek immediate medical help",
      ],
      warnings: [
        "Never pop blisters",
        "Don't use ice or very cold water",
        "Don't apply butter, oil, or ointments",
      ],
    },
    {
      id: "choking",
      title: "Choking",
      icon: "🫁",
      steps: [
        "Ask 'Are you choking?' - if they can't speak, cough, or breathe, help immediately",
        "Stand behind them and wrap your arms around their waist",
        "Make a fist with one hand and place it above their navel",
        "Grasp your fist with the other hand and give quick, upward thrusts",
        "Repeat 5 times, then check if object is dislodged",
        "Continue until object comes out or person loses consciousness",
        "If unconscious, begin CPR and call emergency services",
      ],
      warnings: [
        "Don't slap the back while they're standing",
        "Don't try to remove the object with your fingers unless you can see it",
      ],
    },
    {
      id: "snake-bite",
      title: "Snake Bite",
      icon: "🐍",
      steps: [
        "Move away from the snake to prevent another bite",
        "Keep the person calm and still - movement spreads venom",
        "Remove jewelry and tight clothing before swelling starts",
        "Position the bitten area below heart level if possible",
        "Mark the leading edge of swelling with a pen and note the time",
        "Call emergency services immediately",
        "Try to remember the snake's appearance for identification",
      ],
      warnings: [
        "Don't apply ice or tourniquet",
        "Don't cut the wound or try to suck out venom",
        "Don't give any medication or alcohol",
      ],
    },
    {
      id: "heart-attack",
      title: "Heart Attack Symptoms",
      icon: "❤️",
      steps: [
        "Call emergency services (108) immediately",
        "Help the person sit down and rest comfortably",
        "Loosen any tight clothing",
        "If they're not allergic, give them aspirin to chew (if available)",
        "Stay with them and monitor their condition",
        "Be prepared to perform CPR if they lose consciousness",
      ],
      warnings: [
        "Never drive the person to hospital yourself",
        "Don't let them walk or exert themselves",
        "Don't give them anything to eat or drink except prescribed medication",
      ],
    },
    {
      id: "unconscious",
      title: "Unconscious Person",
      icon: "😴",
      steps: [
        "Check if the person responds to gentle shaking and calling their name",
        "Call emergency services immediately",
        "Check for breathing - look for chest movement, listen and feel for breath",
        "If breathing normally, place in recovery position (on their side)",
        "If not breathing, begin CPR immediately",
        "Keep checking breathing every minute until help arrives",
        "Don't leave them alone",
      ],
      warnings: [
        "Don't give them anything to eat or drink",
        "Don't move them if you suspect spinal injury unless necessary",
      ],
    },
  ], []);

  return (
    <div className="space-y-4">
      {!selectedTopic ? (
        <>
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-12 w-12 rounded-full bg-success-light flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-success" />
              </div>
              <div>
                <h2 className="text-xl font-bold">{t.firstAidTitle}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.firstAidSubtitle}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-3">
              {firstAidTopics.map((topic) => (
                <Card
                  key={topic.id}
                  className="p-4 cursor-pointer hover:shadow-lg hover:border-success transition-all"
                  onClick={() => setSelectedTopic(topic)}
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{topic.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-semibold">{topic.title}</h3>
                      <p className="text-sm text-muted-foreground">
                        {topic.steps.length} {t.steps}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </Card>
              ))}
            </div>
          </Card>

          <Card className="p-4 bg-emergency-light border-emergency/20">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-emergency flex-shrink-0 mt-0.5" />
              <div className="space-y-1 text-sm">
                <p className="font-medium text-emergency">{t.important}:</p>
                <p className="text-emergency/90">
                  {t.firstAidDisclaimer}
                </p>
              </div>
            </div>
          </Card>
        </>
      ) : (
        <div className="space-y-4">
          <Button
            onClick={() => setSelectedTopic(null)}
            variant="outline"
            className="mb-2"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            {t.backToTopics}
          </Button>

          <Card className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="text-4xl">{selectedTopic.icon}</div>
              <div>
                <h2 className="text-2xl font-bold">{selectedTopic.title}</h2>
                <p className="text-sm text-muted-foreground">
                  {t.followSteps}
                </p>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-4 mb-6">
              <h3 className="font-semibold text-lg">{t.steps}:</h3>
              {selectedTopic.steps.map((step, index) => (
                <Card key={index} className="p-4 bg-success-light border-success/20">
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-success text-success-foreground flex items-center justify-center font-bold">
                      {index + 1}
                    </div>
                    <p className="text-success flex-1 pt-1">{step}</p>
                  </div>
                </Card>
              ))}
            </div>

            {/* Warnings */}
            {selectedTopic.warnings.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-lg flex items-center gap-2 text-emergency">
                  <AlertCircle className="h-5 w-5" />
                  {t.warnings}:
                </h3>
                {selectedTopic.warnings.map((warning, index) => (
                  <Card key={index} className="p-4 bg-emergency-light border-emergency/20">
                    <p className="text-emergency text-sm">⚠️ {warning}</p>
                  </Card>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4 bg-info-light border-info/20">
            <p className="text-sm text-info">
              <strong>{t.remember}:</strong> {t.generalGuidelines}
            </p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FirstAidGuide;