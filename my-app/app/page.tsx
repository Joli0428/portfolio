"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

// 不要顯示的頁碼（對應檔名 02、029）
const SKIP = [2, 29];

// 檔名規則：01~09、010~030
const pages = Array.from({ length: 30 }, (_, i) => i + 1)
  .filter((n) => !SKIP.includes(n))
  .map((n) => `/portfolio/0${n}.jpeg`);

const TOTAL = pages.length;

const LINKEDIN_URL = "https://www.linkedin.com/in/jolichou";

export default function Home() {
  const scroller = useRef<HTMLDivElement>(null);
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const [ended, setEnded] = useState(false);

  const goTo = useCallback((i: number) => {
    const el = scroller.current;
    if (!el) return;
    const next = Math.max(0, Math.min(TOTAL - 1, i));
    const slide = el.children[next] as HTMLElement | undefined;
    slide?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
  }, []);

  // 追蹤目前在哪一頁（給電腦版的箭頭按鈕用）
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = (entry.target as HTMLElement).dataset.index;
          if (entry.isIntersecting && idx !== undefined) {
            setCurrent(Number(idx));
          }
        });
      },
      { root: el, threshold: 0.5 }
    );
    Array.from(el.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, []);

  // 依捲動位置即時判斷：是否離開封面、是否滑到底
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const onScroll = () => {
      const portrait = window.matchMedia("(orientation: portrait)").matches;
      const moved = el.scrollTop > 8 || el.scrollLeft > 8;
      const atEnd = portrait
        ? el.scrollTop + el.clientHeight >= el.scrollHeight - 2
        : el.scrollLeft + el.clientWidth >= el.scrollWidth - 2;
      setStarted(moved);
      setEnded(moved && atEnd);
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
    <main className={`paper ${started ? "started" : ""} ${ended ? "ended" : ""}`}>
      <div className="scroller" ref={scroller}>
        {pages.map((src, i) => (
          <section className="slide" key={src} data-index={i}>
            <Image
              src={src}
              alt={`作品集第 ${i + 1} 頁`}
              width={1920}
              height={1357}
              sizes="100vw"
              priority={i < 2}
            />
          </section>
        ))}
        {/* 橫放 / 電腦時，最後多一個空白頁，滑到這裡就顯示連結 */}
        <div className="end-spacer" aria-hidden="true" />
      </div>

      {/* 外層負責淡入淡出 */}
      <div className="hint" aria-hidden="true">
        <div className="hint-inner">
          <span className="hint-arrow" />
          <span className="hint-text">往上滑開始閱讀</span>
        </div>
      </div>

      {/* 結尾：名字 + LinkedIn */}
      <div className="end">
        <a
          className="end-link"
          href={LINKEDIN_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="end-name">周湧秝 / JOLI</span>
          <svg
            className="end-icon"
            viewBox="0 0 24 24"
            aria-hidden="true"
            fill="currentColor"
          >
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
          <span className="end-text">LinkedIn</span>
        </a>
      </div>

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
    </main>
  );
}