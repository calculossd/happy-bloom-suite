import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import { cleanup } from "@testing-library/react";

beforeEach(() => {
  try {
    localStorage.clear();
  } catch {
    /* noop */
  }
  // Reset bambuzau fallback store
  // @ts-expect-error test global
  if (typeof window !== "undefined") (window as any)._bambuzau_fallback_store = {};
});

afterEach(() => {
  cleanup();
});