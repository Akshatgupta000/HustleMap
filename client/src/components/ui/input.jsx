import * as React from "react";

import { cn } from "../../lib/cn";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-xl border border-notion-border bg-notion-card px-3 py-2 text-sm text-notion-text shadow-soft transition-all duration-200 placeholder:text-notion-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-notion-accent/30 focus-visible:ring-offset-2 focus-visible:ring-offset-notion-bg disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };

