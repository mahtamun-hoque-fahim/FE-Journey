import Link from "next/link";
import { NavLink } from "./nav-link";

const links = [
  { href: "/", label: "Home" },
  { href: "/search", label: "Search" },
  { href: "/favorites", label: "Favorites" },
  { href: "/assistant", label: "Assistant" },
  { href: "/playground/3d-viewer", label: "3D Viewer" },
  { href: "/health", label: "Health" },
];

export function NavBar() {
  return (
    <header className="border-b border-border bg-surface/60 backdrop-blur">
      {/* aria-label distinguishes this nav from any in-page navigation
          landmarks a screen reader might encounter further down the tree. */}
      <nav
        aria-label="Main navigation"
        className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6"
      >
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded"
        >
          Flavorly
        </Link>
        <ul className="flex items-center gap-1 text-sm" role="list">
          {links.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href} label={link.label} />
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
