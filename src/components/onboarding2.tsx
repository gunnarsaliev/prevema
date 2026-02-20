"use client";

import {
  ChevronLeftIcon,
  Chrome,
  LayoutGrid,
  Leaf,
  Lock,
  LucideIcon,
  Puzzle,
  Shield,
  Sparkles,
  Star,
  User,
  Workflow,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface IconListItem {
  icon: LucideIcon;
  title: string;
}

interface StepDef {
  title: string;
  description: string | IconListItem[];
  className?: string;
  isBlocking?: boolean;
  component: React.ComponentType<StepComponentProps>;
  secondaryCta?: React.ComponentType;
  cta?: React.ComponentType<StepCtaProps>;
}

const Background = () => {
  return (
    <div className="flex h-[100dvh] w-full items-start">
      <div className="h-full w-64 shrink-0 border-r">
        <div className="flex h-14 w-full items-center border-b p-4">
          <img
            src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/shadcnblocks-logo-word.png"
            className="w-40 dark:invert"
            alt="logo"
          />
        </div>
        <ul className="space-y-2 p-4">
          {Array.from({ length: 5 }).map((_, index) => {
            return (
              <li
                key={`dummy-link-${index}`}
                className="block h-8 w-50 rounded-md bg-muted"
              />
            );
          })}
        </ul>
      </div>
      <div className="flex h-14 w-full items-center border-b p-4">
        <span className="block h-8 w-full max-w-50 rounded-md bg-muted" />
      </div>
    </div>
  );
};

interface StepIndicatorProps {
  totalSteps: number;
  currentStep: number;
}

const StepIndicator = ({ totalSteps, currentStep }: StepIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: totalSteps }).map((_, i) => {
        return (
          <span
            key={`step-indicator-${i}`}
            className={cn(
              "block size-2 rounded-full transition-colors",
              currentStep >= i ? "bg-primary" : "border bg-muted",
            )}
          />
        );
      })}
    </div>
  );
};

interface FadeContainerProps {
  children: React.ReactNode;
  condition: boolean;
  className?: string;
}

const FadeContainer = ({
  children,
  condition,
  className,
}: FadeContainerProps) => {
  const fadeVariants = {
    initial: {
      opacity: 0,
      filter: "blur(4px)",
    },
    animate: {
      opacity: 1,
      filter: "blur(0px)",
    },
    exit: {
      opacity: 0,
      filter: "blur(4px)",
    },
  };

  return (
    <AnimatePresence mode="popLayout">
      {condition && (
        <motion.div
          variants={fadeVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface StepDescriptionCardProps {
  title: string;
  description: string | IconListItem[];
}

const StepDescriptionCard = ({
  title,
  description,
}: StepDescriptionCardProps) => {
  return (
    <div className="space-y-2 md:space-y-4">
      <h3 className="text-xl font-semibold md:text-4xl">{title}</h3>
      <div className="text-sm leading-tight text-muted-foreground md:text-base">
        {typeof description === "string" ? (
          <p>{description}</p>
        ) : (
          <ul className="space-y-4">
            {description?.map((item, i) => {
              return (
                <li key={`step-${i}`} className="flex items-center gap-2">
                  <item.icon className="size-4 shrink-0" />
                  <p>{item.title}</p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

interface StepComponentProps {
  stepIndex: number;
  onValidationChange: (stepIndex: number, isValid: boolean) => void;
}

interface StepCtaProps {
  onClick: () => void;
  disabled?: boolean;
}

const StepOneComponent = () => {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-2 gap-2 md:gap-4"
    >
      <div className="space-y-2">
        <Label>First Name</Label>
        <Input type="text" placeholder="Alex" className="bg-background" />
      </div>
      <div className="space-y-2">
        <Label>Last Name</Label>
        <Input type="text" placeholder="Morgan" className="bg-background" />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>Where do you work?</Label>
        <Input type="text" placeholder="Acme Inc." className="bg-background" />
      </div>
      <div className="col-span-2 space-y-2">
        <Label>What industry are you in?</Label>
        <Select>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select an industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 space-y-2">
        <Label>How many people are on your team?</Label>
        <Select>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select a team size" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="solo">Just me</SelectItem>
            <SelectItem value="small">2-10 people</SelectItem>
            <SelectItem value="medium">11-50 people</SelectItem>
            <SelectItem value="large">51-200 people</SelectItem>
            <SelectItem value="enterprise">200+ people</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="col-span-2 space-y-2">
        <Label>What best describes your role?</Label>
        <Select>
          <SelectTrigger className="w-full bg-background">
            <SelectValue placeholder="Select a role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="founder">Founder / CEO</SelectItem>
            <SelectItem value="sales">Sales</SelectItem>
            <SelectItem value="marketing">Marketing</SelectItem>
            <SelectItem value="operations">Operations</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </form>
  );
};

const StepTwoComponent = () => {
  const goalOptions = [
    { value: "close-deals", label: "Close more deals" },
    { value: "grow-network", label: "Grow my network" },
    { value: "track-pipeline", label: "Track my pipeline" },
    { value: "automate-outreach", label: "Automate outreach" },
    { value: "team-collaboration", label: "Collaborate with team" },
    { value: "find-prospects", label: "Find new prospects" },
    { value: "retain-customers", label: "Retain customers" },
    { value: "analyze-performance", label: "Analyze performance" },
    { value: "streamline-workflow", label: "Streamline workflow" },
    { value: "other", label: "Something else" },
  ];

  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const toggleGoal = (goalValue: string, checked: boolean) => {
    setSelectedGoals((prev) =>
      checked
        ? [...prev, goalValue]
        : prev.filter((value) => value !== goalValue),
    );
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="grid grid-cols-2 gap-6 pb-2 lg:gap-8"
    >
      {goalOptions.map((goal) => {
        const isSelected = selectedGoals.includes(goal.value);
        return (
          <Label htmlFor={goal.value} key={goal.value}>
            <div
              role="button"
              className={cn(
                "flex w-full cursor-pointer items-center gap-2 rounded-full md:px-6 md:py-4",
                selectedGoals.includes(goal.value)
                  ? "md:bg-muted"
                  : "md:bg-muted/50",
              )}
            >
              <Checkbox
                id={goal.value}
                checked={isSelected}
                onCheckedChange={(checked) =>
                  toggleGoal(goal.value, checked === true)
                }
                className="bg-background"
              />
              {goal.label}
            </div>
          </Label>
        );
      })}
    </form>
  );
};

const StepThreeComponent = ({
  stepIndex,
  onValidationChange,
}: StepComponentProps) => {
  const [isConnected, setIsConnected] = useState<string | boolean>(false);

  const handleConnectButtonClick = (provider: string) => {
    setIsConnected(provider);
    onValidationChange(stepIndex, true);
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 md:min-h-[40.5dvh]">
      <Button
        variant="outline"
        onClick={() => handleConnectButtonClick("gmail")}
        disabled={!!isConnected}
      >
        <img src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/google-icon.svg" className="size-4" alt="Google" />
        {isConnected === "gmail" ? "Connected" : "Continue with Google"}
      </Button>
      <Button
        variant="outline"
        onClick={() => handleConnectButtonClick("facebook")}
        disabled={!!isConnected}
      >
        <img src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/logos/facebook-icon.svg" className="size-4" alt="Facebook" />
        {isConnected === "facebook" ? "Connected" : "Continue with Facebook"}
      </Button>
      <Button
        variant="link"
        onClick={() => handleConnectButtonClick("manual")}
        disabled={!!isConnected}
      >
        {isConnected === "manual" ? "Skipped" : "Skip for now"}
      </Button>
    </div>
  );
};

const StepFourComponent = () => {
  return (
    <div className="flex h-full flex-col items-center justify-between md:min-h-[40.5dvh]">
      <img
        src="https://deifkwefumgah.cloudfront.net/shadcnblocks/block/dashboard-placeholder.png"
        className="w-full"
        style={{
          maskImage: "linear-gradient(to bottom, black 0%, transparent 100%)",
        }}
        alt="Dashboard placeholder"
      />
      <div className="flex w-full items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="size-4 fill-primary stroke-green-200" />
          <p>50k+ active users</p>
        </div>
        <div className="flex items-center gap-2">
          <p>Rated 4.9/5</p>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => {
              return <Star key={i} className="size-4 fill-primary" />;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const StepFourSecondaryCta = () => {
  return (
    <Button className="w-full" size="lg">
      Get the Extension
    </Button>
  );
};

const StepFourCta = ({ onClick, disabled }: StepCtaProps) => {
  return (
    <Button
      className="w-full"
      size="lg"
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
    >
      Maybe Later
    </Button>
  );
};

const StepFiveComponent = () => {
  const premiumFeatures = [
    {
      icon: LayoutGrid,
      title: "Custom Views",
      description: "Organize your data exactly how you want it",
    },
    {
      icon: Workflow,
      title: "Automation",
      description: "Set up triggers and actions to save time",
    },
    {
      icon: Chrome,
      title: "Web Clipper",
      description: "Save contacts from any website instantly",
    },
    {
      icon: Sparkles,
      title: "AI Insights",
      description: "Get smart suggestions and auto-complete data",
    },
    {
      icon: Puzzle,
      title: "App Connections",
      description: "Sync with 2000+ tools you already use",
    },
    {
      icon: Star,
      title: "Priority Support",
      description: "Dedicated help and onboarding assistance",
    },
  ];

  return (
    <ul className="space-y-4 md:space-y-6">
      {premiumFeatures.map((feature) => (
        <li key={feature.title} className="flex items-start gap-2">
          <feature.icon className="mt-0.5 size-5 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-sm leading-tight font-medium md:text-base">
              {feature.title}
            </p>
            <p className="text-xs text-muted-foreground md:text-sm">
              {feature.description}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
};

const StepFiveCta = ({ onClick, disabled }: StepCtaProps) => {
  return (
    <Button className="w-full" size="lg" onClick={onClick} disabled={disabled}>
      Activate Trial
    </Button>
  );
};

interface Onboarding2Props {
  steps?: StepDef[];
  className?: string;
}

const Onboarding2 = ({
  steps = [
    {
      title: "Tell us about yourself",
      description: "A few quick questions to personalize your experience.",
      className: "bg-orange-200",
      component: StepOneComponent,
    },
    {
      title: "What would you like to achieve?",
      description:
        "Select all that apply. This helps us tailor your dashboard and recommendations.",
      className: "bg-blue-200",
      component: StepTwoComponent,
    },
    {
      title: "Link your accounts",
      description: [
        {
          icon: User,
          title:
            "Automatically sync your contacts, meetings, and conversations",
        },
        {
          icon: Shield,
          title: "Your data stays private and secure",
        },
        {
          icon: Lock,
          title: "Enterprise-grade encryption",
        },
      ],
      className: "bg-pink-200",
      isBlocking: true,
      component: StepThreeComponent,
    },
    {
      title: "Supercharge your browsing",
      description:
        "Our extension lets you save contacts and take notes from any webpage with one click.",
      className: "bg-green-200",
      component: StepFourComponent,
      secondaryCta: StepFourSecondaryCta,
      cta: StepFourCta,
    },
    {
      title: "Unlock the full experience",
      description:
        "Start your 14-day trial and explore every feature. No credit card required.",
      className: "bg-purple-200",
      component: StepFiveComponent,
      cta: StepFiveCta,
    },
  ],
  className,
}: Onboarding2Props) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepValidation, setStepValidation] = useState<Record<number, boolean>>(
    {},
  );

  const handleStepValidChange = (stepIndex: number, isValid: boolean) => {
    setStepValidation((prev) => ({ ...prev, [stepIndex]: isValid }));
  };

  const canProceed = () => {
    const step = steps[currentStep];

    if (!step.component || !step.isBlocking) return true;

    return stepValidation[currentStep] === true;
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <section>
      <Background />

      <Dialog open={true}>
        <DialogContent
          showCloseButton={false}
          className={cn(
            "flex items-center justify-center overflow-hidden rounded-none p-0 md:max-w-3xl md:items-stretch lg:max-w-5xl",
            className,
          )}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>Onboarding</DialogTitle>
            <DialogDescription>Onboarding Dialog</DialogDescription>
          </DialogHeader>

          <div className="flex min-h-[40dvh] w-full flex-col-reverse items-start tracking-tighter md:flex-row">
            <div className="flex h-full w-full flex-col justify-between gap-4 p-6 pb-6 md:flex-[45%] md:gap-6 lg:p-12">
              <div className="space-y-2">
                <FadeContainer condition={currentStep > 0}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrevious}
                    disabled={currentStep === 0}
                  >
                    <ChevronLeftIcon />
                    Back
                  </Button>
                </FadeContainer>
                <StepDescriptionCard
                  title={step.title}
                  description={step.description}
                />
              </div>

              <div className="space-y-4 md:space-y-6">
                <FadeContainer condition={canProceed()} className="space-y-2">
                  {step.cta ? (
                    <step.cta onClick={handleNext} disabled={!canProceed()} />
                  ) : (
                    <Button
                      size="lg"
                      className="w-full"
                      onClick={handleNext}
                      disabled={
                        currentStep === steps.length - 1 || !canProceed()
                      }
                    >
                      Next
                    </Button>
                  )}
                  {step.secondaryCta && <step.secondaryCta />}
                </FadeContainer>

                <StepIndicator
                  totalSteps={steps.length}
                  currentStep={currentStep}
                />
              </div>
            </div>

            <div
              className={cn(
                "flex h-full w-full flex-[55%] shrink-0 items-center justify-center p-6 transition-colors lg:p-12",
                step.className || "bg-foreground/30",
              )}
            >
              <step.component
                stepIndex={currentStep}
                onValidationChange={handleStepValidChange}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export { Onboarding2 };
