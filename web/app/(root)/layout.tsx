import React from "react";
import { Navbar } from "@/components/shared/navbar";

const nav = [
  {
    name: "Product",
    items: [
      { label: "Features", href: "/features" },
      { label: "Pricing", href: "/pricing" },
      { label: "Integrations", href: "/integrations" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    name: "Resources",
    items: [
      { label: "Docs", href: "/docs" },
      { label: "Blog", href: "/blog" },
      { label: "Help Center", href: "/help" },
      { label: "API Reference", href: "/docs/api" },
    ],
  },
  {
    name: "Company",
    items: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Navbar nav={nav} ctaLabel="Get started" ctaHref="/signup" />
      {children}
    </>
  );
}