import { useMemo, useState } from "react";
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
  RocketIcon,
  SunIcon,
} from "@radix-ui/react-icons";
import { KeyboardInput, MobileScroll, useKeyboard } from "./mobile";

const STATE_MACHINE = "State Machine 1";
const LAST_STEP = 6;

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
              <PrimaryButton onClick={() => fireRiveTrigger("ff")}>Start first mission</PrimaryButton>
              <button className="text-button" type="button" onClick={moveBackward}>Review settings</button>
            </>
          )}
        </section>
      </main>
    </MobileScroll>
  );
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
