import { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default async function LocaleLayout({ children }: Props) {
  return (
    <>
      <div className="container mt-[var(--header-height)]">{children}</div>
    </>
  );
}
