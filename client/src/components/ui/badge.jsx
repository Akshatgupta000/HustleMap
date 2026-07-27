/* eslint-disable react-refresh/only-export-components */
import * as React from "react";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        default: "border-charcoal bg-white text-charcoal",
        muted: "border-charcoal/20 bg-transparent text-charcoal/60",
        accent: "border-charcoal bg-charcoal/5 text-charcoal",
        success: "border-accent-green bg-white text-accent-green",
        warning: "border-accent-yellow bg-white text-accent-yellow",
        danger: "border-red-500 bg-white text-red-500",
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

