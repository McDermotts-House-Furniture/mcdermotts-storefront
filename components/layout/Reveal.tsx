"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type JSX,
  type ReactNode,
  type Ref,
} from "react";

/* useLayoutEffect warns during SSR; fall back to useEffect on the server. */
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Fade-and-rise on first scroll into view, using the shared .mcd-reveal classes
 * from globals.css. Honours prefers-reduced-motion.
 */
export interface RevealProps {
  children?: ReactNode;
  /** 1–4; each step adds one stagger delay. */
  order?: number;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  style?: CSSProperties;
}

export function Reveal({ children, order = 1, as = "div", className, style }: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  /* Fail open: content is visible unless we can prove it is below the fold,
     and it always becomes visible again within 1.2s even if no trigger fires. */
  const [seen, setSeen] = useState(true);

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
      return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    setSeen(false);

    let io: IntersectionObserver | null = null;
    let timer = 0;
    function cleanup() {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", check);
      window.removeEventListener("resize", check);
      if (io) {
        io.disconnect();
        io = null;
      }
    }
    function show() {
      setSeen(true);
      cleanup();
    }
    function check() {
      if (el && el.getBoundingClientRect().top < window.innerHeight * 0.9) show();
    }
    timer = window.setTimeout(show, 1200);
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
    if (window.IntersectionObserver) {
      io = new IntersectionObserver(
        (entries) => entries.forEach((e) => e.isIntersecting && show()),
        { rootMargin: "0px 0px -10% 0px" }
      );
      io.observe(el);
    }
    return cleanup;
  }, []);

  const Tag = as as ElementType;
  const cls = [
    "mcd-reveal",
    seen ? "is-in" : "",
    order > 1 ? `mcd-reveal-${Math.min(order, 4)}` : "",
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Tag ref={ref as Ref<HTMLElement>} className={cls} style={style}>
      {children}
    </Tag>
  );
}
