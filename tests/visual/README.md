# Visual regression tests

Playwright (Apache 2.0) opens every page of `website/` at 390x844 (phone) and 1280x800 (desktop), compares a screenshot with the committed baseline in `baselines/`, and fails on any console error. A last test checks that a Dadi lesson starts.

Run from this folder (needs Node 18+ and Python 3, which serves the site locally):

    npm install
    npx playwright install chromium
    npm test            # compare with baselines
    npm run update      # after an intended visual change: rewrite baselines, then review and commit them

Baselines were made with Chromium on Linux. Other systems render fonts slightly differently; regenerate locally if every page differs by a small amount.
