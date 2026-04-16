import React, { useCallback } from "react";

interface SampleCardProps {
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
  isLoading?: boolean;
  error?: string;
}

export function SampleCard({
  title,
  description,
  badge,
  onClick,
  isLoading,
  error,
}: SampleCardProps) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick();
      }
    },
    [onClick]
  );

  if (isLoading) {
    return <p aria-live="polite">Loading...</p>;
  }

  if (error) {
    return <p role="alert" aria-live="assertive">{error}</p>;
  }

  return (
    <article
      aria-label={title}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      style={{ cursor: onClick ? "pointer" : undefined }}
    >
      {badge && (
        <span aria-label="badge" style={{ marginRight: 8 }}>
          {badge}
        </span>
      )}
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
}
