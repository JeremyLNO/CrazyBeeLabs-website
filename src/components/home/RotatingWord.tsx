"use client";

import { useEffect, useRef, useState } from "react";
import { useT } from "@/lib/i18n/LanguageProvider";

export function RotatingWord() {
  const { tArray } = useT();
  const fromDict = tArray("words");
  const WORDS = fromDict.length ? fromDict : ["simple"];
  const key = WORDS.join("|"); // changes when the locale changes

  const rotRef = useRef<HTMLSpanElement>(null);
  const trackRef = useRef<HTMLSpanElement>(null);
  const [i, setI] = useState(0);
  const [noTransition, setNoTransition] = useState(false);

  // append a clone of the first word so the loop is seamless
  const items = [...WORDS, WORDS[0]];

  // reset to the first word whenever the word list (locale) changes
  useEffect(() => {
    setNoTransition(true);
    setI(0);
  }, [key]);

  // size the slot to the widest word so the line never reflows
  useEffect(() => {
    const rot = rotRef.current;
    const track = trackRef.current;
    if (!rot || !track) return;
    const measure = () => {
      let max = 0;
      Array.from(track.children).forEach((c) => {
        max = Math.max(max, (c as HTMLElement).getBoundingClientRect().width);
      });
      if (max) rot.style.width = `${Math.ceil(max)}px`;
    };
    measure();
    if (document.fonts?.ready) document.fonts.ready.then(measure);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [key]);

  useEffect(() => {
    const t = setInterval(() => setI((v) => v + 1), 2300);
    return () => clearInterval(t);
  }, [key]);

  // when we land on the clone, snap back to 0 without an animation
  useEffect(() => {
    if (i === WORDS.length) {
      const t = setTimeout(() => {
        setNoTransition(true);
        setI(0);
      }, 650);
      return () => clearTimeout(t);
    }
    if (noTransition) {
      const r = requestAnimationFrame(() => setNoTransition(false));
      return () => cancelAnimationFrame(r);
    }
  }, [i, noTransition, WORDS.length]);

  return (
    <span className="rotator" ref={rotRef} aria-label={WORDS.join(", ")}>
      <span
        ref={trackRef}
        className="rotator-track"
        style={{
          transform: `translateY(-${i * 1.12}em)`,
          transition: noTransition ? "none" : undefined,
        }}
      >
        {items.map((w, idx) => (
          <span className="rotator-word" key={idx} aria-hidden="true">
            {w}
          </span>
        ))}
      </span>
    </span>
  );
}
