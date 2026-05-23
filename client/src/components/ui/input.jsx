import * as React from "react";

import { cn } from "../../lib/cn";

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-full border border-charcoal bg-transparent px-4 py-2 text-[14px] text-charcoal shadow-none transition-all duration-200 placeholder:text-charcoal/40 focus-visible:outline-none focus-visible:border-charcoal focus-visible:ring-2 focus-visible:ring-charcoal/20 disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };

