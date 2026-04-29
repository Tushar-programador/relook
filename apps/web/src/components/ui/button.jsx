import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "../../lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary px-5 py-3 text-white shadow-panel hover:opacity-90",
        secondary: "bg-card px-5 py-3 text-foreground ring-1 ring-border hover:bg-muted",
        ghost: "px-4 py-2 text-foreground hover:bg-muted"
      }
    },
    defaultVariants: {
      variant: "primary"
    }
  }
);

export function Button({ className, variant, asChild = false, ...props }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant }), className)} {...props} />;
}