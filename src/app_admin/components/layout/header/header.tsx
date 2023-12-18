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
    <div
      id="wrap-header"
      className="fixed left-0 right-0 top-0 z-10 h-12 shadow supports-[backdrop-filter]:bg-background/80 mx-auto"
      ref={headerRef}
    >
      <header className="flex h-12 w-full items-center justify-between">
        <div className={"flex items-center space-x-4 lg:space-x-6 h-12 px-6"}>
          <Link
            href="/"
            className="text-sm font-medium transition-colors hover:text-primary"
          >
            ホーム
          </Link>
          <Link
            href="/user"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            ユーザー
          </Link>
        </div>
      </header>
    </div>
  );
};

export default Header;
