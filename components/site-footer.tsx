import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-wrap">
        <p>© {new Date().getFullYear()} Robert Smith</p>
        <p>
          <Link href="/rss.xml">RSS</Link>
        </p>
      </div>
    </footer>
  );
}
