import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

const primaryNavItems = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/experiments/temporal-discounting", label: "Experiments" },
  { href: "/publications", label: "Publications" }
];

const secondaryNavItems = [
  { href: "/contact", label: "Contact" },
  { href: "/about", label: "About" },
  { href: "/cv", label: "CV" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <div className="brand-row">
          <ThemeToggle />
        </div>
        <nav aria-label="Primary navigation" className="primary-nav">
          <ul className="nav-list">
            {primaryNavItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li className="nav-dropdown">
              <button type="button" className="nav-dropdown-trigger" aria-haspopup="true">
                More
              </button>
              <ul className="nav-dropdown-menu" aria-label="More pages">
                {secondaryNavItems.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href}>{item.label}</Link>
                  </li>
                ))}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
