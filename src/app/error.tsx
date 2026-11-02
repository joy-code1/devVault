"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="empty-state panel">
      <h1>Something went wrong</h1>
      <p>
        Your saved data is still in this browser. Try opening the page again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
