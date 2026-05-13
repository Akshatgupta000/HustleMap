import * as React from "react";

import { cn } from "../../lib/cn";

function Card({ className, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        className,
      )}
      {...props}
    />
  );
}

function CardHeader({ className, ...props }) {
  return <div className={cn("p-6 pb-0", className)} {...props} />;
}

function CardTitle({ className, ...props }) {
  return (
    <div className={cn("text-base font-semibold text-slate-900", className)} {...props} />
  );
}

function CardDescription({ className, ...props }) {
  return (
    <div className={cn("text-sm text-slate-500", className)} {...props} />
  );
}

function CardContent({ className, ...props }) {
  return <div className={cn("p-6", className)} {...props} />;
}

function CardFooter({ className, ...props }) {
  return (
    <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
  );
}

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};

