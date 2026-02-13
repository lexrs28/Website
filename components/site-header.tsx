import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/cv", label: "CV" },
  { href: "/publications", label: "Publications" },
  { href: "/projects", label: "Projects" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" }
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <div className="brand-row">
          <Link href="/" className="site-title">
            Robert Smith
          </Link>
          <ThemeToggle />
        </div>
        <nav aria-label="Primary navigation" className="primary-nav">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
