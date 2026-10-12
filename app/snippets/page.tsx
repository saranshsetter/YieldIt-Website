"use client";

import { BRAND } from "@/lib/brand";
import SnippetDeck from "@/components/SnippetDeck";

export default function SnippetsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5">
        <h1 className="text-xl font-semibold">{BRAND.modules.snippets}</h1>
        <p className="text-sm text-muted">Click to copy, filled for the selected lead. <span className="kbd">⌘/Ctrl K</span> opens the deck from anywhere.</p>
      </div>
      <SnippetDeck mode="page" />
    </div>
  );
}
