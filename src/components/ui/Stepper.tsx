import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

const steps = ["Account", "Profile", "Review"]

export function Stepper({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center justify-between">
      {steps.map((step, index) => {
        const completed = index < currentStep
        const active = index === currentStep

        return (
          <div key={step} className="flex items-center gap-2">
            <div
              className={cn(
                "h-8 w-8 rounded-full flex items-center justify-center border",
                completed && "bg-primary text-white",
                active && "border-primary"
              )}
            >
              {completed ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span className={active ? "font-semibold" : "text-muted-foreground"}>
              {step}
            </span>
          </div>
        )
      })}
    </div>
  )
}
