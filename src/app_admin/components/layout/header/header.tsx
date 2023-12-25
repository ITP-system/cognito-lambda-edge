"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

import { cn } from "@/lib/utils";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

const headerList = [
  { name: "ホーム", href: "/" },
  { name: "ユーザー", href: "/user" },
];

type HeaderTypes = {
  className?: string;
  props?: React.HTMLAttributes<HTMLDivElement>;
};

export const Header = ({ className, ...props }: HeaderTypes) => {
  const pathname = usePathname();

  return (
    <div className="relative">
      <ScrollArea className="max-w-[600px] lg:max-w-none">
        <div className={cn("my-4 flex items-center", className)} {...props}>
          {headerList.map((item, index) => {
            return (
              <Link
                href={item.href}
                key={item.href}
                className={cn(
                  "flex h-7 items-center justify-center rounded-full px-4 text-center text-sm transition-colors hover:text-primary",
                  (pathname?.startsWith(item.href) && item.href !== "/") ||
                    (index === 0 && pathname === "/")
                    ? "bg-gray-300 font-medium text-primary"
                    : "text-muted-foreground",
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" className="invisible" />
      </ScrollArea>
    </div>
  );
};

export default Header;
