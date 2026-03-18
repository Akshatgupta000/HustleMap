import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";

import { cn } from "../../lib/cn";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-notion-accent text-white shadow-soft hover:brightness-[0.98] active:translate-y-[0.5px]",
        secondary:
          "bg-white text-notion-text border border-notion-border shadow-soft hover:bg-black/5 active:translate-y-[0.5px]",
        ghost: "hover:bg-black/5 text-notion-text",
        destructive:
          "bg-red-600 text-white shadow-soft hover:bg-red-700 active:translate-y-[0.5px]",
        outline:
          "bg-transparent border border-notion-border text-notion-text hover:bg-black/5 active:translate-y-[0.5px]",
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

