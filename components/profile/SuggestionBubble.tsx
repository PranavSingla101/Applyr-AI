"use client";

import { X } from "lucide-react";

type Props = {
  value: string;
  onApply: () => void;
  onDismiss: () => void;
};

export function SuggestionBubble({ value, onApply, onDismiss }: Props) {
  return (
    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-accent-muted border border-accent/20 pl-3 pr-1.5 py-1 text-xs font-medium text-accent">
      <button
        type="button"
        onClick={onApply}
        title={`Use "${value}" from your resume`}
        className="truncate hover:underline cursor-pointer"
      >
        Resume says &ldquo;{value}&rdquo;
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss suggestion"
        className="shrink-0 text-accent/60 hover:text-accent cursor-pointer"
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
