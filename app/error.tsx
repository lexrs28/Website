"use client";

import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <article className="prose">
      <h1>Something went wrong</h1>
      <p>An unexpected error occurred while rendering this page.</p>
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </article>
  );
}
