"use client";

import { useState, useLayoutEffect, useRef } from "react";
import Link from "next/link";

const Header = () => {
  const [headerHeight, setHeaderheight] = useState(0);
  const headerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const observer = new ResizeObserver((entries) => {
      entries.forEach((el) => {
        setHeaderheight(el.contentRect.height);
        root.style.setProperty("--header-height", `${headerHeight}px`);
      });
    });
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }
    return () => {
      observer.disconnect();
    };
  }, [headerHeight]);

  return (
    <div id="wrap-header" className="relative overflow-hidden" ref={headerRef}>
      <header className="flex h-12 w-full items-center">
        <div className="flex items-center">
          <Link
            href="/"
            className="rounded-full px-4 text-sm font-medium leading-tight tracking-tighter text-muted-foreground transition-colors hover:text-primary"
          >
            ホーム
          </Link>
          <Link
            href="/user"
            className="rounded-full px-4 text-sm font-medium leading-tight tracking-tighter text-muted-foreground transition-colors hover:text-primary"
          >
            ユーザー
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Header;
