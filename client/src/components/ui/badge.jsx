import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-xl border px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "border-slate-200 bg-white text-slate-900",
        muted: "border-slate-200 bg-slate-50 text-slate-500",
        accent: "border-slate-200 bg-slate-100 text-slate-900",
        success: "border-accent-green/20 bg-accent-green/10 text-accent-green",
        warning: "border-accent-yellow/20 bg-accent-yellow/10 text-accent-yellow",
        danger: "border-red-500/20 bg-red-500/10 text-red-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Badge({ className, variant, ...props }) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };

