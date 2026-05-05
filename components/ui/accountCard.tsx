import * as React from "react";
import { cn } from "@/lib/utils";

// 🔹 Main Card Wrapper
export const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-700 shadow-sm",
        className
      )}
      {...props}
    />
  );
});
Card.displayName = "Card";

// 🔹 Card Header
export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-1.5 p-6 border-b border-gray-100 dark:border-gray-700", className)}
      {...props}
    />
  );
});
CardHeader.displayName = "CardHeader";

// 🔹 Card Title
export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={cn("text-lg font-semibold leading-none tracking-tight text-gray-900 dark:text-gray-100", className)}
      {...props}
    />
  );
});
CardTitle.displayName = "CardTitle";

// 🔹 Card Content
export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div ref={ref} className={cn("p-6 text-gray-700 dark:text-gray-300", className)} {...props} />
  );
});
CardContent.displayName = "CardContent";

// 🔹 (Optional) Footer
export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center p-6 border-t border-gray-100 dark:border-gray-700", className)}
      {...props}
    />
  );
});
CardFooter.displayName = "CardFooter";