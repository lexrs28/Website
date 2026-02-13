import Link from "next/link";

export default function NotFound() {
  return (
    <article className="prose">
      <h1>Page not found</h1>
      <p>The requested page does not exist or may have moved.</p>
      <p>
        <Link href="/">Return to homepage</Link>
      </p>
    </article>
  );
}
