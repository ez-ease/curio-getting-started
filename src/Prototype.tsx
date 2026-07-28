import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alignment,
  Fit,
  Layout,
  useRive,
} from "@rive-app/react-canvas";
import {
  ArrowLeftIcon,
  BackpackIcon,
  CalendarIcon,
  CheckCircledIcon,
  ColorWheelIcon,
  GlobeIcon,
  MagicWandIcon,
  MoonIcon,
  PaperPlaneIcon,
  RocketIcon,
  SpeakerLoudIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import { KeyboardInput, MobileScroll, useKeyboard, useMobileDevice } from "./mobile";

const STATE_MACHINE = "State Machine 1";
const LAST_STEP = 6;
const AI_VISIMES = [
  "aei",
  "o",
  "r",
  "chjsh",
  "bmp",
  "th",
  "fv",
  "qwod",
  "cdgknstxyz",
] as const;

type DemoStatus = "idle" | "listening" | "thinking" | "talking";

type SpeechRecognitionResultEvent = {
  results: {
    0: {
      0: {
        transcript: string;
      };
    };
  };
};

type BrowserSpeechRecognition = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: (() => void) | null;
  onresult: ((event: SpeechRecognitionResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

type SpeechRecognitionWindow = Window & {
  SpeechRecognition?: new () => BrowserSpeechRecognition;
  webkitSpeechRecognition?: new () => BrowserSpeechRecognition;
};

type Choice = {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "purple" | "green" | "yellow";
};

const interests: Choice[] = [
  { label: "Space", value: "space", icon: RocketIcon, color: "purple" },
  { label: "Nature", value: "nature", icon: GlobeIcon, color: "green" },
  { label: "Colors", value: "colors", icon: ColorWheelIcon, color: "yellow" },
];

const checkInTimes: Choice[] = [
  { label: "Morning", value: "morning", icon: SunIcon, color: "yellow" },
  { label: "After school", value: "after-school", icon: BackpackIcon, color: "green" },
  { label: "Evening", value: "evening", icon: MoonIcon, color: "purple" },
];

export default function Prototype() {
  const keyboard = useKeyboard();
  const { deviceId } = useMobileDevice();
  const [mode, setMode] = useState<"onboarding" | "conversation">(() =>
    new URLSearchParams(window.location.search).get("demo") === "ai"
      ? "conversation"
      : "onboarding",
  );
  const [step, setStep] = useState(0);
  const [childName, setChildName] = useState("");
  const [age, setAge] = useState<string | null>(null);
  const [interest, setInterest] = useState<string | null>(null);
  const [checkIn, setCheckIn] = useState<string | null>(null);
  const [calendarConnected, setCalendarConnected] = useState(false);
  const [riveError, setRiveError] = useState(false);

  const layout = useMemo(
    () => new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    [],
  );

  const { rive, RiveComponent } = useRive({
    src: `${import.meta.env.BASE_URL}assets/curio/curio-getting-started.riv`,
    artboard: "Curio",
    stateMachines: STATE_MACHINE,
    autoplay: true,
    autoBind: true,
    layout,
    onLoadError: () => setRiveError(true),
  });

  useEffect(() => {
    if (!rive) return;

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        rive.resizeDrawingSurfaceToCanvas();
      });
    });
    const finalResize = window.setTimeout(() => {
      rive.resizeDrawingSurfaceToCanvas();
    }, 220);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(finalResize);
    };
  }, [deviceId, rive]);

  const fireRiveTrigger = (name: "ff" | "bw") => {
    const trigger = rive?.viewModelInstance?.trigger(name);
    if (!trigger) return false;

    trigger.trigger();
    return true;
  };

  const progress = step === 0 ? 0 : step;
  const canContinue =
    step === 0 ||
    step === 1 ||
    (step === 2 && childName.trim().length > 0) ||
    (step === 3 && age !== null) ||
    (step === 4 && interest !== null) ||
    (step === 5 && checkIn !== null) ||
    step === 6;

  const moveForward = () => {
    if (!canContinue || step >= LAST_STEP) return;
    if (!fireRiveTrigger("ff")) return;
    keyboard.hide();
    setStep(Math.min(LAST_STEP, step + 1));
  };

  const moveBackward = () => {
    if (step <= 0) return;
    if (!fireRiveTrigger("bw")) return;
    keyboard.hide();
    setStep(Math.max(0, step - 1));
  };

  if (mode === "conversation") {
    return (
      <CurioAiDemo
        childName={childName.trim()}
        onBack={() => setMode("onboarding")}
      />
    );
  }

  return (
    <MobileScroll className="app-screen curio-app">
      <main className="onboarding-screen" data-testid="curio-onboarding">
        <header className="onboarding-header">
          {step > 0 && step < LAST_STEP ? (
            <button
              className="back-button"
              type="button"
              onClick={moveBackward}
              aria-label="Go back"
              data-testid="back-button"
            >
              <ArrowLeftIcon />
            </button>
          ) : (
            <span className="header-spacer" aria-hidden="true" />
          )}

          {step > 0 ? (
            <div className="progress-dots" aria-label={`Step ${progress} of ${LAST_STEP}`}>
              {Array.from({ length: LAST_STEP }, (_, index) => (
                <span
                  className={index + 1 === progress ? "progress-dot is-active" : "progress-dot"}
                  key={index}
                />
              ))}
            </div>
          ) : (
            <span className="curio-wordmark">CURIO</span>
          )}

          <span className="header-spacer" aria-hidden="true" />
        </header>

        <section className="rive-stage" aria-label="Animated Curio character">
          {riveError ? (
            <p className="rive-fallback">Curio is getting ready.</p>
          ) : (
            <RiveComponent className="curio-rive" aria-label="Curio animation" />
          )}
        </section>

        <section className="step-content" aria-live="polite">
          {step === 0 && (
            <>
              <p className="eyebrow">YOUR CURIOUS COMPANION</p>
              <h1>Meet Curio!</h1>
              <p className="step-copy">A tiny scientist who learns, explores, and grows with your child.</p>
              <PrimaryButton onClick={moveForward}>Get started</PrimaryButton>
            </>
          )}

          {step === 1 && (
            <>
              <h1>Grown-ups first!</h1>
              <p className="step-copy">A parent or guardian needs to set up Curio.</p>
              <PrimaryButton onClick={moveForward}>I’m a parent or guardian</PrimaryButton>
              <button className="text-button" type="button">Learn about parent controls</button>
            </>
          )}

          {step === 2 && (
            <>
              <h1>What should I call you?</h1>
              <p className="step-copy">This is the name Curio will use.</p>
              <label className="name-field">
                <span className="sr-only">Child’s name</span>
                <KeyboardInput
                  value={childName}
                  onChange={(event) => setChildName(event.target.value)}
                  placeholder="Child’s name"
                  autoComplete="off"
                  data-testid="child-name-input"
                />
              </label>
              <PrimaryButton onClick={moveForward} disabled={!canContinue}>Continue</PrimaryButton>
            </>
          )}

          {step === 3 && (
            <>
              <h1>How old are you?</h1>
              <p className="step-copy">Curio will choose activities that fit just right.</p>
              <div className="age-grid" role="group" aria-label="Choose age">
                {["4", "5", "6", "7"].map((value) => (
                  <button
                    className={age === value ? "age-choice is-selected" : "age-choice"}
                    key={value}
                    type="button"
                    onClick={() => setAge(value)}
                    aria-pressed={age === value}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <PrimaryButton onClick={moveForward} disabled={!canContinue}>Continue</PrimaryButton>
            </>
          )}

          {step === 4 && (
            <>
              <h1>What makes you curious?</h1>
              <p className="step-copy">Pick one. You can explore everything later.</p>
              <ChoiceGrid
                choices={interests}
                selected={interest}
                onSelect={setInterest}
                label="Choose an interest"
              />
              <PrimaryButton onClick={moveForward} disabled={!canContinue}>Continue</PrimaryButton>
            </>
          )}

          {step === 5 && (
            <>
              <h1>When should Curio check in?</h1>
              <p className="step-copy">Curio already uses your local time.</p>
              <ChoiceGrid
                choices={checkInTimes}
                selected={checkIn}
                onSelect={setCheckIn}
                label="Choose a check-in time"
              />
              <button
                className={calendarConnected ? "calendar-button is-connected" : "calendar-button"}
                type="button"
                onClick={() => setCalendarConnected((value) => !value)}
                aria-pressed={calendarConnected}
              >
                {calendarConnected ? <CheckCircledIcon /> : <CalendarIcon />}
                <span>{calendarConnected ? "School calendar connected" : "Connect school calendar"}</span>
                <small>Optional</small>
              </button>
              <PrimaryButton onClick={moveForward} disabled={!canContinue}>Continue</PrimaryButton>
            </>
          )}

          {step === 6 && (
            <>
              <MagicWandIcon className="ready-icon" aria-hidden="true" />
              <h1>Curio is ready!</h1>
              <p className="step-copy">
                Let’s explore your first big question{childName.trim() ? `, ${childName.trim()}` : ""}.
              </p>
              <PrimaryButton
                onClick={() => {
                  if (!fireRiveTrigger("ff")) return;
                  keyboard.hide();
                  setMode("conversation");
                }}
              >
                Talk to Curio
              </PrimaryButton>
              <button className="text-button" type="button" onClick={moveBackward}>Review settings</button>
            </>
          )}
        </section>
      </main>
    </MobileScroll>
  );
}

function CurioAiDemo({
  childName,
  onBack,
}: {
  childName: string;
  onBack: () => void;
}) {
  const keyboard = useKeyboard();
  const { deviceId } = useMobileDevice();
  const [question, setQuestion] = useState("");
  const [lastQuestion, setLastQuestion] = useState("");
  const [answer, setAnswer] = useState(
    `Hi${childName ? `, ${childName}` : ""}! Ask me a curious question.`,
  );
  const [status, setStatus] = useState<DemoStatus>("idle");
  const [riveError, setRiveError] = useState(false);
  const visemeTimer = useRef<number | null>(null);
  const visemeIndex = useRef(0);
  const responseTimer = useRef<number | null>(null);
  const fallbackSpeechTimer = useRef<number | null>(null);
  const speechWatchFrame = useRef<number | null>(null);
  const speechHasStarted = useRef(false);
  const recognition = useRef<BrowserSpeechRecognition | null>(null);

  const layout = useMemo(
    () => new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
    [],
  );

  const { rive, RiveComponent } = useRive({
    src: `${import.meta.env.BASE_URL}assets/curio/curio-ai-build-library.riv`,
    artboard: "Curio",
    stateMachines: STATE_MACHINE,
    autoplay: true,
    autoBind: true,
    layout,
    onLoadError: () => setRiveError(true),
  });

  const setRiveNumber = (name: string, value: number) => {
    const input = rive?.viewModelInstance?.number(name);
    if (input) input.value = value;
  };

  const fireState = (name: "idle" | "thinking" | "listening") => {
    rive?.viewModelInstance?.trigger(name)?.trigger();
  };

  const stopVisemeTimer = () => {
    if (visemeTimer.current !== null) {
      window.clearInterval(visemeTimer.current);
      visemeTimer.current = null;
    }
  };

  const resetVisemeNumbers = () => {
    AI_VISIMES.forEach((name) => setRiveNumber(name, 0));
  };

  const stopSpeechWatch = () => {
    if (speechWatchFrame.current !== null) {
      window.cancelAnimationFrame(speechWatchFrame.current);
      speechWatchFrame.current = null;
    }
    speechHasStarted.current = false;
  };

  const setSilentMouth = () => {
    stopVisemeTimer();
    stopSpeechWatch();
    resetVisemeNumbers();
    setRiveNumber("mouthIdle", 100);
  };

  const finishSpeaking = () => {
    if (fallbackSpeechTimer.current !== null) {
      window.clearTimeout(fallbackSpeechTimer.current);
      fallbackSpeechTimer.current = null;
    }
    setSilentMouth();
    setStatus("idle");
  };

  const startVisemes = (text: string) => {
    stopVisemeTimer();
    resetVisemeNumbers();
    setRiveNumber("mouthIdle", 0);
    const sequence = createVisemeSequence(text);
    visemeIndex.current = 0;

    const showNextViseme = () => {
      resetVisemeNumbers();
      setRiveNumber(sequence[visemeIndex.current % sequence.length], 100);
      visemeIndex.current += 1;
    };

    showNextViseme();
    visemeTimer.current = window.setInterval(showNextViseme, 82);
  };

  const watchSpeechCompletion = (synthesizer: SpeechSynthesis) => {
    stopSpeechWatch();

    const checkSpeech = () => {
      if (synthesizer.speaking) {
        speechHasStarted.current = true;
      } else if (speechHasStarted.current) {
        finishSpeaking();
        return;
      }

      speechWatchFrame.current = window.requestAnimationFrame(checkSpeech);
    };

    speechWatchFrame.current = window.requestAnimationFrame(checkSpeech);
  };

  const speak = (text: string) => {
    const synthesizer = (window as unknown as { speechSynthesis?: SpeechSynthesis })
      .speechSynthesis;
    synthesizer?.cancel();
    if (!synthesizer) {
      setStatus("talking");
      fireState("idle");
      startVisemes(text);
      fallbackSpeechTimer.current = window.setTimeout(
        finishSpeaking,
        Math.max(1800, text.length * 45),
      );
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = pickChildLikeVoice(synthesizer.getVoices());
    utterance.rate = 0.98;
    utterance.pitch = 1.22;
    utterance.onstart = () => {
      setStatus("talking");
      fireState("idle");
      startVisemes(text);
      watchSpeechCompletion(synthesizer);
    };
    utterance.onboundary = (event) => {
      visemeIndex.current = Math.round(
        (event.charIndex / Math.max(1, text.length)) * createVisemeSequence(text).length,
      );
    };
    utterance.onend = finishSpeaking;
    utterance.onerror = finishSpeaking;
    synthesizer.speak(utterance);
  };

  const askCurio = (rawQuestion: string) => {
    const cleanQuestion = rawQuestion.trim();
    if (!cleanQuestion || status === "thinking" || status === "talking") return;

    keyboard.hide();
    window.speechSynthesis?.cancel();
    setSilentMouth();
    setQuestion("");
    setLastQuestion(cleanQuestion);
    setAnswer("");
    setStatus("thinking");
    fireState("thinking");

    responseTimer.current = window.setTimeout(() => {
      const response = getCurioResponse(cleanQuestion);
      setAnswer(response);
      speak(response);
    }, 900);
  };

  const startListening = () => {
    if (status === "thinking" || status === "talking") return;

    const browserWindow = window as SpeechRecognitionWindow;
    const Recognition =
      browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;

    if (!Recognition) {
      setAnswer("Your browser cannot use the microphone here. Type your question instead!");
      return;
    }

    keyboard.hide();
    const listener = new Recognition();
    recognition.current = listener;
    listener.continuous = false;
    listener.interimResults = false;
    listener.lang = "en-US";
    listener.onstart = () => {
      setSilentMouth();
      setStatus("listening");
      fireState("listening");
    };
    listener.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setQuestion(transcript);
      setStatus("idle");
      window.setTimeout(() => askCurio(transcript), 120);
    };
    listener.onerror = () => {
      setStatus("idle");
      fireState("idle");
      setAnswer("I missed that. Try the microphone again, or type your question.");
    };
    listener.onend = () => {
      recognition.current = null;
      setStatus((current) => (current === "listening" ? "idle" : current));
    };
    listener.start();
  };

  useEffect(() => {
    if (!rive) return;

    const syncMouth = () => {
      setSilentMouth();
      fireState("idle");
    };
    const first = window.setTimeout(syncMouth, 0);
    const second = window.setTimeout(syncMouth, 250);

    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [rive]);

  useEffect(() => {
    if (!rive) return;

    let secondFrame = 0;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        rive.resizeDrawingSurfaceToCanvas();
      });
    });
    const finalResize = window.setTimeout(() => {
      rive.resizeDrawingSurfaceToCanvas();
    }, 220);

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame) window.cancelAnimationFrame(secondFrame);
      window.clearTimeout(finalResize);
    };
  }, [deviceId, rive]);

  useEffect(
    () => () => {
      if (visemeTimer.current !== null) window.clearInterval(visemeTimer.current);
      if (responseTimer.current !== null) window.clearTimeout(responseTimer.current);
      if (fallbackSpeechTimer.current !== null) {
        window.clearTimeout(fallbackSpeechTimer.current);
      }
      if (speechWatchFrame.current !== null) {
        window.cancelAnimationFrame(speechWatchFrame.current);
      }
      recognition.current?.stop();
      window.speechSynthesis?.cancel();
    },
    [],
  );

  const statusCopy = {
    idle: "Ready",
    listening: "Listening…",
    thinking: "Thinking…",
    talking: "Talking",
  }[status];

  return (
    <MobileScroll className="app-screen curio-app curio-ai-app">
      <main className="ai-demo-screen" data-testid="curio-ai-demo">
        <header className="ai-demo-header">
          <button
            className="back-button"
            type="button"
            onClick={() => {
              keyboard.hide();
              onBack();
            }}
            aria-label="Back to setup"
          >
            <ArrowLeftIcon />
          </button>
          <div className="ai-demo-title">
            <strong>CURIO</strong>
            <span>AI DEMO</span>
          </div>
          <div className={`ai-status status-${status}`}>
            <span aria-hidden="true" />
            {statusCopy}
          </div>
        </header>

        <section className="ai-rive-stage" aria-label="Curio conversation animation">
          {riveError ? (
            <p className="rive-fallback">Curio is getting ready.</p>
          ) : (
            <RiveComponent className="curio-rive" aria-label="Curio AI character" />
          )}
        </section>

        <section className="ai-conversation" aria-live="polite">
          {lastQuestion && <p className="child-bubble">{lastQuestion}</p>}
          <div className={answer ? "curio-bubble" : "curio-bubble is-thinking"}>
            {answer || (
              <>
                <span />
                <span />
                <span />
              </>
            )}
          </div>

          <div className="prompt-row" aria-label="Try a question">
            {["Why is the sky blue?", "How do plants eat?", "Tell me about the Moon"].map(
              (prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => askCurio(prompt)}
                  disabled={status === "thinking" || status === "talking"}
                >
                  {prompt}
                </button>
              ),
            )}
          </div>

          <div className="ai-composer">
            <label>
              <span className="sr-only">Ask Curio a question</span>
              <KeyboardInput
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") askCurio(question);
                }}
                placeholder="Ask Curio anything…"
                autoComplete="off"
                data-testid="curio-question-input"
              />
            </label>
            <button
              className={status === "listening" ? "mic-button is-listening" : "mic-button"}
              type="button"
              onClick={startListening}
              aria-label={status === "listening" ? "Listening" : "Ask with microphone"}
              disabled={status === "thinking" || status === "talking"}
            >
              <SpeakerLoudIcon />
            </button>
            <button
              className="send-button"
              type="button"
              onClick={() => askCurio(question)}
              aria-label="Send question"
              disabled={!question.trim() || status === "thinking" || status === "talking"}
            >
              <PaperPlaneIcon />
            </button>
          </div>

          <p className="demo-note">Free interactive demo · no account needed</p>
        </section>
      </main>
    </MobileScroll>
  );
}

function createVisemeSequence(text: string) {
  const sequence = text
    .toLowerCase()
    .split("")
    .map<(typeof AI_VISIMES)[number] | null>((letter) => {
      if ("aeiy".includes(letter)) return "aei";
      if ("ouw".includes(letter)) return "qwod";
      if (letter === "r") return "r";
      if (letter === "j") return "chjsh";
      if ("bmp".includes(letter)) return "bmp";
      if (letter === "h") return "th";
      if ("fv".includes(letter)) return "fv";
      if ("cdgknstxzq".includes(letter)) return "cdgknstxyz";
      return null;
    })
    .filter((value): value is (typeof AI_VISIMES)[number] => value !== null);

  return sequence.length > 0 ? sequence : ["aei"];
}

function pickChildLikeVoice(voices: SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter((voice) =>
    voice.lang.toLowerCase().startsWith("en"),
  );
  const candidates = englishVoices.length > 0 ? englishVoices : voices;
  const preferredNames = [
    "microsoft ana",
    "child",
    "kid",
    "microsoft aria",
    "microsoft jenny",
    "google uk english female",
    "samantha",
    "zira",
  ];

  return (
    candidates
      .map((voice) => {
        const name = voice.name.toLowerCase();
        const preference = preferredNames.findIndex((hint) => name.includes(hint));
        return { voice, preference: preference === -1 ? preferredNames.length : preference };
      })
      .sort((a, b) => a.preference - b.preference)[0]?.voice ?? null
  );
}

function getCurioResponse(question: string) {
  const lower = question.toLowerCase();

  if (lower.includes("sky") && lower.includes("blue")) {
    return "Sunlight is made of many colors. Blue light bounces around the sky more than the other colors, so blue reaches our eyes from every direction!";
  }
  if (lower.includes("plant") || lower.includes("tree") || lower.includes("flower")) {
    return "Plants make their own food! Their leaves use sunlight, water, and air in a process called photosynthesis. It is like a tiny solar-powered kitchen.";
  }
  if (lower.includes("moon")) {
    return "The Moon does not make its own light. It reflects sunlight, like a giant rocky mirror orbiting Earth.";
  }
  if (lower.includes("dinosaur")) {
    return "Dinosaurs lived millions of years ago. Some ate plants, some ate meat, and birds are their living relatives today!";
  }
  if (lower.includes("space") || lower.includes("star") || lower.includes("planet")) {
    return "Space is full of stars, planets, dust, and giant clouds of gas. Every bright star you see is a distant sun.";
  }
  if (lower.includes("sleep")) {
    return "Sleep helps your brain organize everything you learned. It is like charging your curious-mind battery for tomorrow.";
  }

  return "That is a brilliant scientist question! First, tell me what you notice. Then we can make a guess and find a way to test it together.";
}

function PrimaryButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="primary-button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-testid="primary-action"
    >
      {children}
    </button>
  );
}

function ChoiceGrid({
  choices,
  label,
  onSelect,
  selected,
}: {
  choices: Choice[];
  label: string;
  onSelect: (value: string) => void;
  selected: string | null;
}) {
  return (
    <div className="choice-grid" role="group" aria-label={label}>
      {choices.map(({ color, icon: Icon, label: choiceLabel, value }) => (
        <button
          className={`choice-card choice-${color}${selected === value ? " is-selected" : ""}`}
          key={value}
          type="button"
          onClick={() => onSelect(value)}
          aria-pressed={selected === value}
        >
          <Icon className="choice-icon" />
          <span>{choiceLabel}</span>
        </button>
      ))}
    </div>
  );
}
