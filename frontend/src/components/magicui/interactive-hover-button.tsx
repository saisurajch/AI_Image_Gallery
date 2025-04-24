import React from "react";
import { ChevronRight, MousePointer } from "lucide-react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface InteractiveHoverButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  initialIcon?: LucideIcon;
  hoverIcon?: LucideIcon;
  href?: string; // Add href for navigation
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, className, initialIcon: InitialIcon = MousePointer, hoverIcon: HoverIcon = ChevronRight, href, ...props }, ref) => {
  const ButtonContent = (
    <button
      ref={ref}
      className={cn(
        "group relative w-auto cursor-pointer overflow-hidden rounded-3xl border border-muted bg-muted p-2 px-6 text-center text-foreground transition-all duration-300",
        "hover:bg-muted hover:text-primary-foreground",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <div className="relative flex items-center justify-center transition-all duration-300">
          <div className="absolute h-8 w-8 rounded-full bg-primary opacity-0 transition-all duration-300 group-hover:scale-[12] group-hover:opacity-100"></div>
          <InitialIcon className="h-4 w-4 text-primary transition-all duration-500 group-hover:opacity-0" />
        </div>
        <span className="inline-block transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
          {children}
        </span>
      </div>
      <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 text-primary-foreground opacity-0 transition-all duration-300 group-hover:-translate-x-5 group-hover:opacity-100">
        <span>{children}</span>
        <HoverIcon className="h-4 w-4" />
      </div>
    </button>
  );

  return href ? (
    <a href={href}>
      {ButtonContent}
    </a>
  ) : (
    ButtonContent
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";
