import React from "react";

interface SampleCardProps {
  title: string;
  description: string;
  badge?: string;
  onClick?: () => void;
  isLoading?: boolean;
}

export function SampleCard({
  title,
  description,
  badge,
  onClick,
  isLoading,
}: SampleCardProps) {
  if (isLoading) {
    return <p>Loading...</p>;
  }

  return (
    <article
      aria-label={title}
      onClick={onClick}
      role={onClick ? "button" : undefined}
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
