import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-gold-500/30 bg-gold-500/10 text-gold-400",
        secondary: "border-bar-border bg-bar-dark text-gray-400",
        destructive: "border-red-700 bg-red-900/30 text-red-400",
        outline: "border-current bg-transparent",
        success: "border-green-700 bg-green-900/30 text-green-400",
        warning: "border-yellow-700 bg-yellow-900/30 text-yellow-400",
        info: "border-blue-700 bg-blue-900/30 text-blue-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
