import React from "react";

interface SampleCardProps {
  title: string;
  description: string;
}

export function SampleCard({ title, description }: SampleCardProps) {
  return (
    <article aria-label={title}>
      <h2>{title}</h2>
      <p>{description}</p>
    </article>
  );
}
