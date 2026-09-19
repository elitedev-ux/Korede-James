import React from "react";

export default function PolicyPage({ eyebrow, title, sections }) {
  return (
    <section className="px-6 pt-40 pb-28">
      <div className="mx-auto max-w-4xl">
        <p className="mb-6 text-[10px] font-semibold uppercase tracking-[0.45em] text-amber-700">
          {eyebrow}
        </p>
        <h1 className="mb-14 font-serif text-4xl font-light uppercase leading-tight tracking-[0.18em] md:text-6xl">
          {title}
        </h1>
        <div className="grid gap-8 border-y border-black/10 py-10">
          {sections.map((section) => (
            <article
              className="grid gap-4 border-b border-black/10 pb-8 last:border-b-0 last:pb-0 md:grid-cols-[14rem_minmax(0,1fr)]"
              key={section.title}
            >
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.28em]">
                {section.title}
              </h2>
              <p className="text-sm font-light leading-loose text-gray-600">
                {section.body}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
