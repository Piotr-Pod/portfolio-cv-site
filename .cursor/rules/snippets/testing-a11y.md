```ts
// __tests__/Button.a11y.test.tsx
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import "@testing-library/jest-dom";
import { Button } from "@/components/ui/button";

test("button has no a11y violations", async () => {
  const { container } = render(<Button>Click</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```
```ts
// e2e/a11y.spec.ts — Playwright
import { test, expect } from "@playwright/test";

test("keyboard navigation and landmarks", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  // assert focus visible moves
  const active = await page.evaluate(() => document.activeElement?.tagName);
  expect(active).toBeDefined();
});
```
