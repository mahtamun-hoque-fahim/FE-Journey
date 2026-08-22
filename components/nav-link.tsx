"use client";

// usePathname is a React hook so this must be a Client Component.
// The NavBar itself stays a Server Component; only the individual links
// need the pathname to set aria-current="page".
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavLinkProps {
  href: string;
  label: string;
}

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  // "/" is an exact match only; all other routes use startsWith so that
  // e.g. /playground/3d-viewer keeps "3D Viewer" marked as current.
  const isActive =
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={`rounded-full px-3 py-2 text-sm transition-colors hover:bg-surface-hover hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
        isActive ? "font-medium text-foreground" : "text-muted"
      }`}
    >
      {label}
    </Link>
  );
}
