"use client";

import type { QA } from "@/lib/content";

/** Accordion list of question/answer pairs. */
export function FaqList({ items }: { items: QA[] }) {
  if (!items?.length) return null;
  return (
    <div className="faq-list">
      {items.map((qa, i) => (
        <details className="faq-item" key={i}>
          <summary>
            <span>{qa.q}</span>
            <span className="faq-chevron" aria-hidden="true">
              ⌄
            </span>
          </summary>
          <p>{qa.a}</p>
        </details>
      ))}
    </div>
  );
}
