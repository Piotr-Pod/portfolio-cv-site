# 70 — Hosting/CI

- **Vercel** (SSR/ISR). Public env przez `NEXT_PUBLIC_*`.
- **GitHub Actions**: lint, testy, Lighthouse.

**Przykładowy workflow**
```yaml
name: CI
on: [push, pull_request]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm test --if-present
      - run: npm run build

  lighthouse:
    needs: build-test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm i -g @lhci/cli
      - run: lhci autorun || echo "LHCI failed (non-blocking)"
```
