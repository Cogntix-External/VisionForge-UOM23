"use client";

export default function Layout({ title, children }) {
  return (
    <section className="h-full w-full">
      {title ? <h1 className="sr-only">{title}</h1> : null}
      {children}
    </section>
  );
}
