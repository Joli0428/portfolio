"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// 不要顯示的頁碼（對應檔名 02、029）
const SKIP = [2, 29];

// 檔名規則：01~09、010~030，剛好都是 `0${數字}.jpeg`
const pages = Array.from({ length: 30 }, (_, i) => i + 1)
  .filter((n) => !SKIP.includes(n))
  .map((n) => `/portfolio/0${n}.jpeg`);

const TOTAL = pages.length;

export default function Home() {
  const scroller = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLButtonElement>(null);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = scroller.current;
    if (!el) return;
    const next = Math.max(0, Math.min(TOTAL - 1, i));
    const slide = el.children[next] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, []);

  // 判斷目前頁碼
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setCurrent(Number((entry.target as HTMLElement).dataset.index));
          }
        });
      },
      { root: el, threshold: 0.6 }
    );
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  // 提示淡出 + 判斷是否已開始閱讀
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const dist = Math.max(el.scrollTop, el.scrollLeft);
      const o = Math.max(0, 1 - dist / 80);
      if (hintRef.current) {
        hintRef.current.style.opacity = String(o);
        hintRef.current.style.pointerEvents = o === 0 ? "none" : "auto";
      }
      setStarted(dist > 40);
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") goTo(current + 1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") goTo(current - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [current, goTo]);

  return (
    <main className="paper">
      <div className="scroller" ref={scroller}>
        {pages.map((src, i) => (
          <section
            className={`slide ${i === 0 ? "cover" : ""}`}
            key={src}
            data-index={i}
          >
            <Image
              src={src}
              alt={i === 0 ? "作品集封面" : `作品集第 ${i + 1} 頁`}
              width={1920}
              height={1357}
              sizes="100vw"
              priority={i < 2}
            />
          </section>
        ))}
      </div>

      <button className="hint" ref={hintRef} onClick={() => goTo(1)}>
        <span className="hint-arrow" />
        <span className="hint-text">往上滑開始閱讀</span>
      </button>

      <button
        className="nav prev"
        onClick={() => goTo(current - 1)}
        disabled={current === 0}
        aria-label="上一頁"
      >
        ‹
      </button>
      <button
        className="nav next"
        onClick={() => goTo(current + 1)}
        disabled={current === TOTAL - 1}
        aria-label="下一頁"
      >
        ›
      </button>

      {started && current > 0 && (
        <div className="counter">
          {current + 1} / {TOTAL}
        </div>
      )}
    </main>
  );
}