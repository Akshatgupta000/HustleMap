import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-slate-900 text-white shadow-sm hover:brightness-110 active:translate-y-[0.5px] font-bold",
        secondary:
          "bg-white text-slate-900 border border-slate-200 shadow-sm hover:bg-white/5 active:translate-y-[0.5px]",
        ghost: "hover:bg-white/5 text-slate-900",
        destructive:
          "bg-red-500 text-white shadow-sm hover:bg-red-600 active:translate-y-[0.5px]",
        outline:
          "bg-transparent border border-slate-200 text-slate-900 hover:bg-white/5 active:translate-y-[0.5px]",
      },
      size: {
        sm: "h-9 px-3",
        md: "h-10 px-4",
        lg: "h-11 px-5",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "secondary",
      size: "md",
    },
  },
);

const Button = React.forwardRef(
  (
    { className, variant, size, asChild = false, type = "button", ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        type={asChild ? undefined : type}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };

