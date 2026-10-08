// @ts-check
const { test, expect } = require('@playwright/test');

const SEVEN = ['Anchor', 'Dawn', 'Kindred', 'Pyre', 'Shadow', 'Wanderer', 'Grug'];

/** Collect console errors and failed same-origin requests for each test. */
test.beforeEach(async ({ page }) => {
  const problems = [];
  page.on('console', (m) => { if (m.type() === 'error') problems.push('console: ' + m.text()); });
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message));
  page.on('response', (r) => {
    if (r.status() >= 400 && r.url().startsWith('http://localhost')) problems.push(r.status() + ' ' + r.url());
  });
  // @ts-ignore stash on the page for the afterEach check
  page._problems = problems;
  // Mock the GitHub API so tests don't depend on the network or the repo existing yet.
  await page.route('https://api.github.com/**', (route) => route.fulfill({ json: { stargazers_count: 1234 } }));
  await page.goto('/');
});

test.afterEach(async ({ page }) => {
  // @ts-ignore
  expect(page._problems, 'no console errors, page errors or failed local requests').toEqual([]);
});

test.describe('content', () => {
  test('title and hero describe a council of seven', async ({ page }) => {
    await expect(page).toHaveTitle(/seven minds/i);
    await expect(page.locator('.pill-link b')).toHaveText('7 agents');
    await expect(page.locator('h1')).toContainText('One decision.');
    await expect(page.locator('h1')).toContainText('Seven minds.');
  });

  test('no leftover 21 or 22 agent counts anywhere on the page', async ({ page }) => {
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/\b2[12]\s+(agents|personalit|minds)/i);
    expect(text).not.toMatch(/twenty-(one|two) minds/i);
    expect(text).not.toMatch(/\b2[12] of 2[12]\b/);
  });

  test('meet the seven shows exactly seven agents in order', async ({ page }) => {
    const cells = page.locator('#seven-grid .s-cell');
    await expect(cells).toHaveCount(7);
    await expect(cells.locator('h3')).toHaveText(SEVEN);
  });

  test('every agent has a voice quote, voice badge, blind spot and merged traits', async ({ page }) => {
    const cells = page.locator('#seven-grid .s-cell');
    for (let i = 0; i < 7; i++) {
      const c = cells.nth(i);
      await expect(c.locator('.says')).not.toBeEmpty();
      await expect(c.locator('.badge')).toHaveCount(3);
      expect(await c.locator('.lex .lex-w').count()).toBeGreaterThanOrEqual(4);
      await expect(c.locator('.blind')).not.toBeEmpty();
      expect(await c.locator('.s-merge > span').count()).toBeGreaterThanOrEqual(2);
    }
  });

  test('all 22 traits appear exactly once across the seven', async ({ page }) => {
    const traits = await page.locator('#seven-grid .s-merge > span').allInnerTexts();
    expect(traits).toHaveLength(22);
    expect(new Set(traits).size).toBe(22);
  });

  test('voices match their personalities', async ({ page }) => {
    const quote = (n) => page.locator(`.s-cell[data-n="${n}"] .says`);
    await expect(quote('Grug')).toContainText(/burf|woof|meow/i);
    await expect(quote('Shadow')).toContainText(/psst/i);
    await expect(quote('Pyre')).toContainText(/WHAT|nah fam/i);
    await expect(quote('Kindred')).toContainText(/habibi|aigoo|jaan|cari\u00f1o|can\u0131m/i);
    await expect(quote('Dawn')).toContainText(/no cap|massive W|slay/i);
    await expect(quote('Wanderer')).toContainText(/forgive me|sumimasen|tiens|\u00bfy si/i);
    await expect(page.locator('.s-cell[data-n="Grug"] .s-merge')).toContainText('Caveman');
    await expect(page.locator('.s-cell[data-n="Grug"] .s-merge')).toContainText('Naive');
    await expect(page.locator('.s-cell[data-n="Kindred"] .s-merge')).toContainText('Love');
    await expect(page.locator('.s-cell[data-n="Kindred"] .s-merge')).toContainText('Compassion');
    await expect(page.locator('.s-cell[data-n="Anchor"] .s-merge')).toContainText('Angel');
    await expect(page.locator('.s-cell[data-n="Shadow"] .s-merge')).toContainText('Devil');
  });

  test('angel and devil are not merged into the same agent', async ({ page }) => {
    const angelHome = page.locator('.s-cell', { has: page.locator('.s-merge', { hasText: 'Angel' }) });
    const devilHome = page.locator('.s-cell', { has: page.locator('.s-merge', { hasText: 'Devil' }) });
    expect(await angelHome.getAttribute('data-n')).not.toBe(await devilHome.getAttribute('data-n'));
  });

  test('example report has one row per agent and five tension pairs exist', async ({ page }) => {
    await expect(page.locator('.report tbody tr')).toHaveCount(7);
    await expect(page.locator('#pairs .pair')).toHaveCount(5);
  });

  test('votes add up: up is +1, down is -1, and the result matches the score', async ({ page }) => {
    const votes = await page.locator('.report tbody td.vote').evaluateAll((els) => els.map((e) => Number(e.dataset.vote)));
    expect(votes).toHaveLength(7);
    expect(votes.every((v) => v === 1 || v === -1)).toBe(true);
    const sum = votes.reduce((a, b) => a + b, 0);
    const up = votes.filter((v) => v === 1).length;
    await expect(page.locator('#score')).toHaveText((sum > 0 ? '+' : '') + sum);
    await expect(page.locator('.report tfoot')).toContainText(up + ' up, ' + (7 - up) + ' down');
    await expect(page.locator('#result')).toContainText(sum > 0 ? 'YES' : sum < 0 ? 'NO' : 'TIE');
    const ups = await page.locator('.report tbody td.vote[data-vote="1"]').allInnerTexts();
    const downs = await page.locator('.report tbody td.vote[data-vote="-1"]').allInnerTexts();
    ups.forEach((t) => expect(t.trim()).toBe('\uD83D\uDFE2 +1'));
    downs.forEach((t) => expect(t.trim()).toBe('\uD83D\uDD34 -1'));
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/[\u2B06\u2B07]/);
  });

  test('every member card shows its own model', async ({ page }) => {
    const models = await page.locator('#seven-grid .s-cell .badge:has(.ph-cpu)').allInnerTexts();
    expect(models.map((m) => m.trim())).toEqual(['Opus', 'Sonnet', 'Sonnet', 'Sonnet', 'Opus', 'Sonnet', 'Haiku']);
  });

  test('flags list matches the skill', async ({ page }) => {
    const flags = await page.locator('.flag code').allInnerTexts();
    expect(flags).toEqual(['none', '--lite', '--only angel,devil', '--skip grug', '--clean']);
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/--seven|--quick|--group/);
  });

  test('copy follows taste rules: no em-dashes', async ({ page }) => {
    const text = await page.locator('body').innerText();
    expect(text).not.toContain('—');
  });
});

test.describe('council builder', () => {
  const cmd = (page) => page.locator('#builder-cmd');

  test('starts with all seven and no flag', async ({ page }) => {
    await expect(page.locator('#tokens .token')).toHaveCount(7);
    await expect(page.locator('#count')).toHaveText('7 of 7');
    await expect(cmd(page)).toHaveText('/quorum "Should I take the offer?"');
  });

  test('angel vs devil preset uses --only', async ({ page }) => {
    await page.getByRole('button', { name: 'Angel vs devil' }).click();
    await expect(page.locator('#count')).toHaveText('2 of 7');
    await expect(cmd(page)).toHaveText('/quorum "Should I take the offer?" --only anchor,shadow');
  });

  test('lite preset uses --lite', async ({ page }) => {
    await page.getByRole('button', { name: 'Lite' }).click();
    await expect(page.locator('#count')).toHaveText('3 of 7');
    await expect(cmd(page)).toHaveText('/quorum "Should I take the offer?" --lite');
  });

  test('dropping one agent uses --skip', async ({ page }) => {
    await page.locator('.token[data-n="Grug"]').click();
    await expect(page.locator('.token[data-n="Grug"]')).toHaveAttribute('aria-pressed', 'false');
    await expect(cmd(page)).toHaveText('/quorum "Should I take the offer?" --skip grug');
  });

  test('clean toggle appends --clean', async ({ page }) => {
    await page.locator('#clean').click();
    await expect(page.locator('#clean')).toHaveAttribute('aria-pressed', 'true');
    await expect(cmd(page)).toHaveText(/--clean$/);
  });

  test('typing a question updates the command and escapes quotes', async ({ page }) => {
    await page.locator('#question').fill('Is "v2" ready?');
    await expect(cmd(page)).toHaveText('/quorum "Is \\"v2\\" ready?"');
  });

  test('clear disables copy', async ({ page }) => {
    await page.getByRole('button', { name: 'Clear' }).click();
    await expect(page.locator('#count')).toHaveText('0 of 7');
    await expect(page.locator('#builder-copy')).toBeDisabled();
  });

  test('copy puts the command on the clipboard', async ({ page, context, browserName }) => {
    test.skip(browserName !== 'chromium', 'clipboard permissions are chromium-only here');
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.getByRole('button', { name: 'Angel vs devil' }).click();
    await page.locator('#builder-copy').click();
    await expect(page.locator('#builder-copy')).toHaveClass(/is-done/);
    const clip = await page.evaluate(() => navigator.clipboard.readText());
    expect(clip).toBe('/quorum "Should I take the offer?" --only anchor,shadow');
  });
});

test.describe('council chamber', () => {
  test('sits right after Meet the seven', async ({ page }) => {
    const order = await page.locator('main > section').evaluateAll((els) => els.map((e) => e.id || e.className));
    expect(order.indexOf('chamber')).toBe(order.indexOf('council') + 1);
  });

  test('question bar is a picker that starts on the weather', async ({ page }) => {
    const q = page.locator('#ask-q');
    await expect(q).toHaveAttribute('role', 'combobox');
    await expect(q).toHaveAttribute('aria-expanded', 'false');
    await expect(page.getByRole('combobox', { name: 'Question for the council' })).toHaveText('How is the weather?');
  });

  test('the picker lists every question, each one once, with the current one selected', async ({ page }) => {
    await page.locator('#ask-bar').scrollIntoViewIfNeeded();
    await page.locator('#ask-q').click();
    await expect(page.locator('#ask-q')).toHaveAttribute('aria-expanded', 'true');
    const list = page.getByRole('listbox', { name: 'Question for the council' });
    await expect(list).toBeVisible();
    const qs = await list.getByRole('option').allInnerTexts();
    expect(qs.length).toBeGreaterThanOrEqual(8);
    expect(new Set(qs).size).toBe(qs.length);
    expect(qs.map((t) => t.trim())).toEqual(expect.arrayContaining(['How is the weather?', 'Pizza or biryani tonight?', 'Cat or dog?', 'Should I learn Rust or Go?', 'Can we ship on a Friday?']));
    await expect(list.locator('[aria-selected="true"]')).toHaveCount(1);
    await expect(list.locator('[aria-selected="true"]')).toHaveText('How is the weather?');
    // Clicking outside closes it without changing the question
    await page.locator('#chamber-title').click();
    await expect(list).toBeHidden();
    await expect(page.locator('#ask-q-text')).toHaveText('How is the weather?');
  });

  test('choosing a question updates the bar and the council answers it', async ({ page }) => {
    await page.locator('#ask-bar').scrollIntoViewIfNeeded();
    await page.locator('#ask-q').click();
    await page.getByRole('option', { name: 'Cat or dog?' }).click();
    await expect(page.locator('#ask-list')).toBeHidden();
    await expect(page.locator('#ask-q-text')).toHaveText('Cat or dog?');
    await expect(page.locator('#ask-q')).toBeFocused();
    // Picking asks straight away: all seven answer, Grug in pet talk
    for (const n of SEVEN) await expect(page.locator(`.bubble[data-n="${n}"] .bubble-in span`)).not.toBeEmpty({ timeout: 8000 });
    await expect(page.locator('.bubble[data-n="Grug"] .bubble-in span')).toHaveText(/woof|meow|wolf/i);
    await expect(page.locator('#chamber-live')).not.toBeEmpty();
    // The Ask button re-asks the picked question
    await page.locator('#ask-q').click();
    await expect(page.getByRole('option', { name: 'Cat or dog?' })).toHaveAttribute('aria-selected', 'true');
    await page.keyboard.press('Escape');
    await page.locator('#ask-btn').click();
    await expect(page.locator('.bubble[data-n="Grug"] .bubble-in span')).toHaveText(/woof|meow|wolf/i, { timeout: 8000 });
  });

  test('the picker works from the keyboard', async ({ page }) => {
    const q = page.locator('#ask-q'), active = () => q.getAttribute('aria-activedescendant');
    await q.focus();
    await page.keyboard.press('ArrowDown');
    await expect(q).toHaveAttribute('aria-expanded', 'true');
    expect(await active()).toBe('ask-opt-weather');
    await page.keyboard.press('ArrowDown');
    expect(await active()).toBe('ask-opt-food');
    await expect(page.locator('#ask-opt-food')).toHaveClass(/active/);
    await page.keyboard.press('End');
    const last = await page.locator('#ask-list [role="option"]').last().getAttribute('id');
    expect(await active()).toBe(last);
    await page.keyboard.press('Home');
    expect(await active()).toBe('ask-opt-weather');
    // Escape closes without choosing and keeps focus
    await page.keyboard.press('Escape');
    await expect(q).toHaveAttribute('aria-expanded', 'false');
    await expect(q).not.toHaveAttribute('aria-activedescendant');
    await expect(q).toBeFocused();
    await expect(page.locator('#ask-q-text')).toHaveText('How is the weather?');
    // Enter opens, arrows move, Enter picks and asks
    await page.keyboard.press('Enter');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await expect(q).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#ask-q-text')).toHaveText('Pizza or biryani tonight?');
    await expect(q).toBeFocused();
    await expect(page.locator('.bubble[data-n="Grug"] .bubble-in span')).not.toBeEmpty({ timeout: 8000 });
    // Type-ahead jumps to the next question starting with that letter
    await page.keyboard.press('c');
    await expect(q).toHaveAttribute('aria-expanded', 'true');
    expect(await active()).toBe('ask-opt-pet');
    await page.keyboard.press('c');
    expect(await active()).toBe('ask-opt-friday');
    // Tab closes and moves on to the Ask button
    await page.keyboard.press('Tab');
    await expect(q).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#ask-btn')).toBeFocused();
  });

  test('the open picker fits a phone screen, with reduced motion too', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 375, height: 812 });
    await page.locator('#ask-bar').scrollIntoViewIfNeeded();
    await page.locator('#ask-q').click();
    const list = page.locator('#ask-list');
    await expect(list).toBeVisible();
    const box = await list.boundingBox();
    expect(box && box.x).toBeGreaterThanOrEqual(0);
    expect(box && box.x + box.width).toBeLessThanOrEqual(375);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
    await page.getByRole('option', { name: 'Tabs or spaces?' }).click();
    await expect(page.locator('#ask-q-text')).toHaveText('Tabs or spaces?');
  });

  test('asking gets an answer from all seven', async ({ page }) => {
    await page.locator('#ask-btn').click();
    for (const n of SEVEN) await expect(page.locator(`.bubble[data-n="${n}"] .bubble-in span`)).not.toBeEmpty({ timeout: 8000 });
    await expect(page.locator('#chamber-live')).not.toBeEmpty();
  });

  test('one poke chip per member, and repeated pokes make them angry', async ({ page }) => {
    await expect(page.locator('#pokes .poke')).toHaveCount(7);
    const chip = page.locator('.poke[data-n="Grug"]');
    // Click inside the page in one go, so the cool-down timer can't sneak in between
    const seen = await chip.evaluate((b) => {
      const bubble = document.querySelector('.bubble[data-n="Grug"]'), out = [];
      for (let i = 0; i < 5; i++) { b.click(); out.push(b.dataset.mood + '/' + bubble.dataset.mood) }
      return out;
    });
    expect(seen).toEqual(['calm/happy', 'calm/happy', 'annoyed/annoyed', 'annoyed/annoyed', 'angry/angry']);
  });

  test('the 3D board loads and pawns answer to hover', async ({ page, isMobile }) => {
    await page.locator('#stage').scrollIntoViewIfNeeded();
    await expect(page.locator('#stage canvas')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('#stage')).not.toHaveClass(/flat/);
    test.skip(isMobile, 'no hover on touch');
    await page.locator('.poke[data-n="Kindred"]').hover();
    await expect(page.locator('.bubble[data-n="Kindred"]')).toHaveClass(/show/);
  });
});

test.describe('chamber loading', () => {
  /** Hold the three.js download until release() is called. */
  async function holdThree(page) {
    let release;
    const held = new Promise((r) => { release = r });
    await page.route('**/assets/vendor/three/three.module.min.js', async (route) => { await held; await route.continue() });
    return () => release();
  }
  const skelAnimations = (page) => page.evaluate(() => document.getAnimations()
    .filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.stage-skel')).length);

  test('a skeleton holds the stage until the board is drawn, with no layout shift', async ({ page }) => {
    const release = await holdThree(page);
    await page.goto('/');
    const stage = page.locator('#stage');
    await stage.scrollIntoViewIfNeeded();
    await expect(page.locator('.stage-skel')).toBeVisible();
    await expect(stage).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('#stage-note')).toHaveText(/Setting up the board/);
    await expect(page.locator('#stage canvas')).toHaveCount(0);
    expect(await skelAnimations(page), 'the skeleton shimmers').toBeGreaterThan(0);
    const before = await stage.boundingBox();
    const pokesBefore = await page.locator('#pokes').boundingBox();

    release();
    await expect(stage).toHaveClass(/ready/, { timeout: 15000 });
    await expect(stage).not.toHaveClass(/flat|loading/);
    await expect(stage).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('.stage-skel')).toHaveCount(0);
    await expect(page.locator('#stage-note')).toBeHidden();
    await expect(page.locator('#stage canvas')).toHaveCSS('opacity', '1');
    const after = await stage.boundingBox();
    const pokesAfter = await page.locator('#pokes').boundingBox();
    expect(after.height).toBe(before.height);
    expect(after.y).toBeCloseTo(before.y, 0);
    expect(pokesAfter.y).toBeCloseTo(pokesBefore.y, 0);
  });

  test('with reduced motion the skeleton is static', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.route('https://api.github.com/**', (route) => route.fulfill({ json: { stargazers_count: 1234 } }));
    const release = await holdThree(p);
    await p.goto('/');
    await p.locator('#stage').scrollIntoViewIfNeeded();
    await expect(p.locator('.stage-skel')).toBeVisible();
    expect(await skelAnimations(p)).toBe(0);
    release();
    await ctx.close();
  });

  test('without WebGL the skeleton goes and the flat council still talks', async ({ page }) => {
    await page.addInitScript(() => {
      const get = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type, ...rest) {
        return /webgl/.test(type) ? null : get.call(this, type, ...rest);
      };
    });
    await page.goto('/');
    await page.locator('#stage').scrollIntoViewIfNeeded();
    await expect(page.locator('.stage-skel')).toHaveCount(0);
    await expect(page.locator('#stage')).toHaveClass(/flat/);
    await expect(page.locator('#stage')).toHaveAttribute('aria-busy', 'false');
    await expect(page.locator('#stage-note')).toHaveText(/couldn't load/);
    await page.locator('.poke[data-n="Grug"]').click();
    await expect(page.locator('.bubble[data-n="Grug"]')).toHaveClass(/show/);
  });

  test('if three.js fails to load, the skeleton goes and the flat fallback shows', async ({ page }) => {
    await page.route('**/assets/vendor/three/three.module.min.js', (route) =>
      route.fulfill({ contentType: 'text/javascript', body: 'throw new Error("three.js unavailable")' }));
    await page.goto('/');
    await page.locator('#stage').scrollIntoViewIfNeeded();
    await expect(page.locator('.stage-skel')).toHaveCount(0);
    await expect(page.locator('#stage')).toHaveClass(/flat/);
    await expect(page.locator('#stage')).not.toHaveClass(/loading/);
    await expect(page.locator('#stage-note')).toHaveText(/couldn't load/);
    await expect(page.locator('#stage canvas')).toHaveCount(0);
  });
});

test.describe('self-hosting', () => {
  test('every request the homepage makes stays on localhost, except the mocked GitHub API', async ({ page }) => {
    const urls = [];
    page.on('request', (r) => urls.push(r.url()));
    await page.goto('/');
    // Visit every section so lazy work (fonts, icons, three.js, videos) kicks in
    for (const id of ['how', 'council', 'chamber', 'videos', 'install']) await page.locator('#' + id).scrollIntoViewIfNeeded();
    await expect(page.locator('#stage')).toHaveClass(/ready/, { timeout: 15000 });
    await page.evaluate(() => document.fonts.ready);
    const outside = urls.filter((u) => !/^(data|blob):/.test(u) && !u.startsWith('http://localhost:5527/') && !u.startsWith('https://api.github.com/'));
    expect(outside).toEqual([]);
    expect(urls.some((u) => u.includes('/assets/vendor/three/three.module.min.js'))).toBe(true);
  });

  test('self-hosted fonts and icons are loaded', async ({ page }) => {
    await page.evaluate(() => document.fonts.ready);
    const ok = await page.evaluate(async () => {
      await Promise.all([document.fonts.load('500 16px "Geist"'), document.fonts.load('400 14px "Geist Mono"')]);
      return {
        geist: document.fonts.check('500 16px "Geist"'),
        mono: document.fonts.check('400 14px "Geist Mono"'),
        icon: getComputedStyle(document.querySelector('.ph'), '::before').content,
      };
    });
    expect(ok.geist).toBe(true);
    expect(ok.mono).toBe(true);
    expect(ok.icon).not.toBe('none');
    await expect.poll(() => page.evaluate(() => [...document.fonts].some((f) => f.family.replace(/"/g, '') === 'Phosphor' && f.status === 'loaded'))).toBe(true);
  });
});

test.describe('interactions', () => {
  test('theme toggle switches and persists across reload', async ({ page }) => {
    const before = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    await page.locator('#theme').click();
    const after = await page.evaluate(() => document.documentElement.getAttribute('data-theme'));
    expect(after).not.toBe(before);
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', /** @type {string} */ (after));
    const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
    expect(bg).toBe(after === 'dark' ? 'rgb(18, 17, 16)' : 'rgb(241, 239, 235)');
  });

  test('install tabs switch between macOS/Linux and Windows', async ({ page }) => {
    await page.locator('#tab-unix').click();
    await expect(page.locator('#code-unix')).toBeVisible();
    await expect(page.locator('#code-win')).toBeHidden();
    await expect(page.locator('#pre-unix')).toContainText('cp -r quorum/skills/quorum');
    await page.locator('#tab-win').click();
    await expect(page.locator('#code-win')).toBeVisible();
    await expect(page.locator('#pre-win')).toContainText('Copy-Item -Recurse');
  });

  test('install shows a one-liner on top, with the manual steps folded underneath', async ({ page }) => {
    await page.locator('#tab-unix').click();
    await expect(page.locator('#quick-unix')).toHaveText('curl -fsSL https://mhfrough.github.io/quorum/install.sh | sh');
    await expect(page.locator('#pre-unix')).toBeHidden();
    await page.locator('#code-unix .manual summary').click();
    await expect(page.locator('#pre-unix')).toBeVisible();
    await page.locator('#tab-win').click();
    await expect(page.locator('#quick-win')).toHaveText('irm https://mhfrough.github.io/quorum/install.ps1 | iex');
  });

  for (const [os, platform, ua, tab] of [
    ['Windows', 'Windows', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'win'],
    ['macOS', 'macOS', 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'unix'],
    ['Linux', 'Linux', 'Mozilla/5.0 (X11; Linux x86_64)', 'unix'],
  ]) {
    test(`install opens the ${os} tab for ${os} visitors`, async ({ page }) => {
      await page.addInitScript(([p, u]) => {
        Object.defineProperty(navigator, 'userAgentData', { get: () => ({ platform: p }) });
        Object.defineProperty(navigator, 'platform', { get: () => p });
        Object.defineProperty(navigator, 'userAgent', { get: () => u });
      }, [platform, ua]);
      await page.reload();
      await expect(page.locator(`#tab-${tab}`)).toHaveAttribute('aria-selected', 'true');
      await expect(page.locator(`#code-${tab}`)).toBeVisible();
      // The hero shows only this OS's one-liner, matching the install tab.
      await expect(page.locator('#hero-install-cmd')).toHaveText(await page.locator(`#quick-${tab}`).textContent());
      await expect(page.locator('#hero-install-prompt')).toHaveText(tab === 'win' ? 'PS>' : '$');
      const box = await page.locator('#hero-install-cmd').evaluate((el) => ({ clipped: el.scrollWidth > el.clientWidth }));
      if (!test.info().project.name.includes('mobile')) expect(box.clipped, 'install line fits without an ellipsis on desktop').toBe(false);
    });
  }

  test('glass nav floats and deepens its shadow after scrolling', async ({ page }) => {
    const nav = page.locator('.nav');
    const filter = await page.locator('.nav-inner').evaluate((n) => getComputedStyle(n).backdropFilter);
    expect(filter).toContain('blur');
    await expect(nav).not.toHaveClass(/scrolled/);
    await page.evaluate(() => window.scrollTo(0, 1200));
    await expect(nav).toHaveClass(/scrolled/);
    const top = await page.locator('.nav-inner').evaluate((n) => n.getBoundingClientRect().top);
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThan(40);
  });

  test('nav links jump to their sections', async ({ page, isMobile }) => {
    test.skip(isMobile, 'nav links are hidden on mobile');
    for (const id of ['how', 'council', 'chamber', 'videos', 'install']) {
      await page.locator(`.nav-links a[href="#${id}"]`).click();
      await expect(page.locator('#' + id)).toBeInViewport();
    }
  });

  test('scrollspy lights the link for the section in view', async ({ page, isMobile }) => {
    test.skip(isMobile, 'nav links are hidden on mobile');
    for (const id of ['how', 'council', 'chamber', 'videos', 'install']) {
      await page.locator(`.nav-links a[href="#${id}"]`).click();
      await expect(page.locator(`.nav-links a[href="#${id}"]`)).toHaveClass(/active/);
      await expect(page.locator('.nav-links a.active')).toHaveCount(1);
    }
  });
});

test.describe('layout', () => {
  for (const [w, h] of [[375, 812], [768, 1024], [1280, 800], [1600, 900]]) {
    test(`no horizontal overflow at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: h });
      await page.reload();
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('desktop hero: headline is two lines and the hero fits the first screen', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop rule');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();
    const h1 = page.locator('h1');
    const { height, lh } = await h1.evaluate((el) => ({
      height: el.getBoundingClientRect().height,
      lh: parseFloat(getComputedStyle(el).lineHeight),
    }));
    expect(Math.round(height / lh)).toBeLessThanOrEqual(2);
    const ctaBottom = await page.locator('.hero .cmd').evaluate((el) => el.getBoundingClientRect().bottom);
    expect(ctaBottom).toBeLessThan(800);
  });

  test('nav pill lines up with the section content edges', async ({ page }) => {
    for (const w of [1024, 1280, 1600]) {
      await page.setViewportSize({ width: w, height: 800 });
      const nav = await page.locator('.nav-inner').evaluate((n) => n.getBoundingClientRect());
      const wrap = await page.locator('#install .wrap').evaluate((e) => {
        const b = e.getBoundingClientRect(), cs = getComputedStyle(e);
        return { left: b.left + parseFloat(cs.paddingLeft), right: b.right - parseFloat(cs.paddingRight) };
      });
      expect(Math.abs(nav.left - wrap.left)).toBeLessThanOrEqual(1);
      expect(Math.abs(nav.right - wrap.right)).toBeLessThanOrEqual(1);
    }
  });

  test('videos section shows playable vertical reels with lazy WebP posters and captions', async ({ page, request }) => {
    const videos = page.locator('#reels video');
    await expect(videos).toHaveCount(2);
    // Nothing loads up front: no video data, and posters wait until the row is near the viewport.
    for (const v of await videos.all()) {
      await expect(v).toHaveAttribute('preload', 'none');
      expect(await v.getAttribute('poster')).toBeNull();
    }
    await page.locator('#videos').scrollIntoViewIfNeeded();
    for (const v of await videos.all()) {
      await expect(v).toHaveAttribute('poster', /\.webp$/);
      expect((await request.get(await v.getAttribute('poster'))).ok()).toBeTruthy();
      // Every reel has English captions.
      const track = v.locator('track[kind="captions"][srclang="en"]');
      await expect(track).toHaveCount(1);
      const vtt = await request.get(await track.getAttribute('src'));
      expect(vtt.ok()).toBeTruthy();
      expect(await vtt.text()).toMatch(/^WEBVTT/);
    }
    await videos.first().evaluate((v) => { v.preload = 'metadata'; v.load(); });
    await expect.poll(() => videos.first().evaluate((v) => v.readyState)).toBeGreaterThanOrEqual(1);
    const ratio = await videos.first().evaluate((v) => v.videoHeight / v.videoWidth);
    expect(ratio).toBeCloseTo(16 / 9, 1);
  });

  test('reels show a skeleton until the poster loads, and never show a scrollbar', async ({ page, isMobile }) => {
    // Hold the posters so the skeleton state is observable.
    let release;
    const gate = new Promise((r) => { release = r; });
    await page.route('**/videos/*.webp', async (route) => { await gate; await route.continue(); });
    // The held poster requests keep the load event pending, so don't wait for it.
    await page.reload({ waitUntil: 'domcontentloaded' });
    const reel = page.locator('#reels .reel').first();
    await expect(reel).toHaveAttribute('aria-busy', 'true');
    await expect(reel).not.toHaveClass(/is-ready/);
    expect(await reel.locator('video').evaluate((v) => getComputedStyle(v).opacity)).toBe('0');
    await page.locator('#videos').scrollIntoViewIfNeeded();
    await expect(reel).not.toHaveClass(/is-ready/);
    release();
    await expect(page.locator('#reels .reel.is-ready')).toHaveCount(2);
    await expect(reel).not.toHaveAttribute('aria-busy', 'true');
    // Desktop: the row fits, so it doesn't scroll at all. Mobile: it swipes, but the scrollbar is hidden.
    const row = await page.locator('#reels').evaluate((r) => ({
      ox: getComputedStyle(r).overflowX, oy: getComputedStyle(r).overflowY, sb: getComputedStyle(r).scrollbarWidth,
      vbar: r.offsetHeight - r.clientHeight,
    }));
    expect(row.vbar).toBe(0);
    if (isMobile) { expect(row.ox).toBe('auto'); expect(row.oy).toBe('hidden'); expect(row.sb).toBe('none'); }
    else expect(row.ox).toBe('visible');
  });

  test('reels show a spinner while playback buffers', async ({ page }) => {
    const reel = page.locator('#reels .reel').first();
    await reel.locator('video').evaluate((v) => v.dispatchEvent(new Event('waiting')));
    await expect(reel).toHaveClass(/is-buffering/);
    await reel.locator('video').evaluate((v) => v.dispatchEvent(new Event('playing')));
    await expect(reel).not.toHaveClass(/is-buffering/);
  });

  test('desktop nav fits on one line', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop rule');
    const h = await page.locator('.nav-links').evaluate((el) => el.getBoundingClientRect().height);
    expect(h).toBeLessThan(30);
  });

  test('seven bento has no empty cells (2+1, 1+1+1, 1+2)', async ({ page, isMobile }) => {
    test.skip(isMobile, 'single column on mobile');
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.reload();
    // Each row must start at the grid's left edge and end at its right edge.
    const rows = await page.locator('#seven-grid .s-cell').evaluateAll((els) => {
      const byTop = {};
      els.forEach((e) => {
        const r = e.getBoundingClientRect();
        const key = Math.round(r.top);
        const row = byTop[key] || (byTop[key] = { left: Infinity, right: -Infinity });
        row.left = Math.min(row.left, r.left);
        row.right = Math.max(row.right, r.right);
      });
      return Object.values(byTop);
    });
    const grid = await page.locator('#seven-grid').evaluate((g) => g.getBoundingClientRect().toJSON());
    expect(rows).toHaveLength(3);
    for (const r of rows) {
      expect(Math.abs(r.left - grid.left)).toBeLessThan(2);
      expect(Math.abs(r.right - grid.right)).toBeLessThan(2);
    }
  });

  test('reduced motion still shows all content', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const p = await ctx.newPage();
    await p.goto('/');
    const op = await p.locator('#seven-grid .s-cell').first().evaluate((el) => getComputedStyle(el).opacity);
    expect(op).toBe('1');
    await ctx.close();
  });
});

test.describe('seo and lighthouse', () => {
  test('has canonical, Open Graph and Twitter tags pointing at a real share image', async ({ page, request }) => {
    const meta = (sel) => page.locator(sel).first().getAttribute('content');
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://mhfrough.github.io/quorum/');
    expect(await meta('meta[name="description"]')).toMatch(/Claude Code skill/);
    for (const p of ['og:type', 'og:url', 'og:title', 'og:description', 'og:image', 'og:image:alt']) {
      expect(await meta(`meta[property="${p}"]`), p).toBeTruthy();
    }
    expect(await meta('meta[name="twitter:card"]')).toBe('summary_large_image');
    // The image the tags point at ships in the repo.
    const img = (await meta('meta[property="og:image"]')).replace('https://mhfrough.github.io/quorum/', '/');
    const res = await request.get(img);
    expect(res.ok()).toBeTruthy();
    expect(res.headers()['content-type']).toMatch(/image\/jpeg/);
  });

  test('has valid schema.org JSON-LD for the app, author, site and videos', async ({ page }) => {
    const data = JSON.parse(await page.locator('script[type="application/ld+json"]').textContent());
    const types = data['@graph'].map((n) => n['@type']);
    expect(types).toEqual(expect.arrayContaining(['SoftwareApplication', 'Person', 'WebSite', 'VideoObject']));
    const app = data['@graph'].find((n) => n['@type'] === 'SoftwareApplication');
    expect(app.name).toBe('Quorum');
    expect(app.codeRepository).toBe('https://github.com/mhfrough/quorum');
  });

  test('robots.txt and sitemap.xml are served', async ({ request }) => {
    expect(await (await request.get('/robots.txt')).text()).toContain('Sitemap: https://mhfrough.github.io/quorum/sitemap.xml');
    expect(await (await request.get('/sitemap.xml')).text()).toContain('<loc>https://mhfrough.github.io/quorum/</loc>');
  });

  test('every font sets font-display (no invisible text while fonts load)', async ({ page }) => {
    const faces = await page.evaluate(() => [...document.fonts].map((f) => [f.family, f.display]));
    expect(faces.length).toBeGreaterThan(0);
    for (const [family, display] of faces) expect([family, display]).toEqual([family, 'swap']);
  });

  test('footer disclaimer text has at least 4.5:1 contrast in both themes', async ({ page }) => {
    for (const theme of ['dark', 'light']) {
      await page.evaluate((t) => document.documentElement.setAttribute('data-theme', t), theme);
      const ratio = await page.locator('.disclaimer').evaluate((el) => {
        const lum = (c) => {
          const [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
          return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        const fg = lum(getComputedStyle(el).color), bg = lum(getComputedStyle(document.body).backgroundColor);
        return (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
      });
      expect(ratio, theme).toBeGreaterThanOrEqual(4.5);
      expect(await page.locator('.disclaimer').evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
    }
  });

  test('looping shimmers and the marquee pause while off screen', async ({ page }) => {
    const states = () => page.evaluate(() => document.getAnimations()
      .filter((a) => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('#reels'))
      .map((a) => a.playState));
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect.poll(states).toEqual(expect.arrayContaining(['paused']));
    expect(await states()).not.toContain('running');
    await page.locator('#reels').scrollIntoViewIfNeeded();
    await expect(page.locator('#reels')).toHaveClass(/in-view/);
  });

  test('raster images on the page are WebP (social share image excepted)', async ({ page }) => {
    await page.locator('#videos').scrollIntoViewIfNeeded();
    await expect(page.locator('#reels video[poster]')).toHaveCount(2);
    const srcs = await page.evaluate(() => [
      ...[...document.images].map((i) => i.currentSrc || i.src),
      ...[...document.querySelectorAll('video[poster]')].map((v) => v.poster),
    ]);
    for (const s of srcs) expect(s).toMatch(/\.(webp|svg)(\?|$)/);
  });
});

test.describe('branding', () => {
  test('hero has no install button', async ({ page }) => {
    await expect(page.locator('.hero a[href="#install"]')).toHaveCount(0);
    await expect(page.locator('.hero-ctas')).toHaveCount(0);
  });

  test('page is branded Quorum with the /quorum command', async ({ page }) => {
    await expect(page).toHaveTitle(/^Quorum/);
    await expect(page.locator('.nav .brand')).toContainText('Quorum');
    await expect(page.locator('#builder-cmd')).toHaveText(/^\/quorum /);
    await expect(page.locator('#pre-unix')).toContainText('https://github.com/mhfrough/quorum.git');
    const text = await page.locator('body').innerText();
    expect(text).not.toMatch(/personality-agents|YOUR-USERNAME/);
  });

  test('star button lives only in the nav and points at the repo', async ({ page }) => {
    const stars = page.locator('.star-btn');
    await expect(stars).toHaveCount(1);
    await expect(page.locator('.nav .star-btn')).toHaveAttribute('href', 'https://github.com/mhfrough/quorum');
    await expect(page.locator('.nav .star-btn')).toContainText('Star');
  });

  test('star button shows the live star count from GitHub', async ({ page }) => {
    const count = page.locator('.nav .star-btn .stars');
    await expect(count).toBeVisible();
    await expect(count).toContainText('1.2k');
  });

  test('favicon is the nav logo mark (users-three on a rounded square)', async ({ page, request }) => {
    await expect(page.locator('link[rel="icon"]')).toHaveAttribute('href', 'favicon.svg');
    const res = await request.get('/favicon.svg');
    expect(res.ok()).toBeTruthy();
    const svg = await res.text();
    expect(svg).toContain('<rect');
    expect(svg).toContain('users-three');
    expect(await page.locator('.nav .brand-mark i')).toHaveClass(/ph-users-three/);
  });

  test('footer credits Mohammad Hamza and links to the GitHub profile', async ({ page }) => {
    await expect(page.locator('footer')).toContainText('Mohammad Hamza');
    const profile = page.locator('footer a[href="https://github.com/mhfrough"]');
    await expect(profile).toHaveCount(1);
    await expect(profile).toContainText('@mhfrough');
  });

  test('footer has a small, faded just-for-fun disclaimer between the logo and the credit', async ({ page }) => {
    const note = page.locator('footer .disclaimer');
    await expect(note).toContainText('Just for fun');
    const order = await page.locator('footer .foot > div:first-child > *').evaluateAll((els) => els.map((e) => e.className || e.tagName));
    expect(order.indexOf('disclaimer')).toBe(1);
    const style = await note.evaluate((e) => ({ size: parseFloat(getComputedStyle(e).fontSize), opacity: Number(getComputedStyle(e).opacity) }));
    expect(style.size).toBeLessThan(14);
    expect(style.opacity).toBeLessThan(1);
  });
});

test.describe('theme and scrolling details', () => {
  test('dark mode is the default, even when the OS prefers light', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'light' });
    const p = await ctx.newPage();
    await p.goto('/');
    await expect(p.locator('html')).toHaveAttribute('data-theme', 'dark');
    expect(await p.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(18, 17, 16)');
    await ctx.close();
  });

  test('dark mode keeps code blocks and featured cards dark', async ({ browser }) => {
    const ctx = await browser.newContext({ colorScheme: 'dark' });
    const p = await ctx.newPage();
    await p.goto('/');
    const lum = (sel) => p.locator(sel).first().evaluate((el) => {
      const [r, g, b] = getComputedStyle(el).backgroundColor.match(/\d+/g).map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    });
    for (const sel of ['.cmd', '.builder-out', '.code', '.s-cell.t-solid', '.how-item:nth-child(3)']) {
      expect(await lum(sel), sel + ' should be dark in dark mode').toBeLessThan(0.25);
    }
    // ...but still distinguishable from the page background
    const bodyLum = await p.evaluate(() => {
      const [r, g, b] = getComputedStyle(document.body).backgroundColor.match(/\d+/g).map(Number);
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    });
    expect(await lum('.cmd')).toBeGreaterThan(bodyLum);
    // the primary button stays light so it still stands out
    expect(await lum('.btn-solid')).toBeGreaterThan(0.7);
    await ctx.close();
  });

  test('anchor jumps clear the sticky nav', async ({ page }) => {
    const pad = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop));
    expect(pad).toBeGreaterThanOrEqual(80);
    await page.evaluate(() => { document.documentElement.style.scrollBehavior = 'auto'; location.hash = '#install'; });
    const navBottom = await page.locator('.nav-inner').evaluate((n) => n.getBoundingClientRect().bottom);
    const titleTop = await page.locator('#install h2').evaluate((n) => n.getBoundingClientRect().top);
    expect(titleTop).toBeGreaterThan(navBottom);
  });

  test('trait chips render one pill per trait (no nested pill around the emoji)', async ({ page }) => {
    const nested = await page.locator('.s-merge > span > span').evaluateAll((els) =>
      els.filter((e) => getComputedStyle(e).backgroundColor !== 'rgba(0, 0, 0, 0)').length);
    expect(nested).toBe(0);
  });
});

test.describe('accessibility basics', () => {
  test('every button and link has an accessible name', async ({ page }) => {
    const unnamed = await page.evaluate(() =>
      [...document.querySelectorAll('button, a')]
        .filter((el) => !(el.getAttribute('aria-label') || el.textContent.trim()))
        .map((el) => el.outerHTML.slice(0, 80))
    );
    expect(unnamed).toEqual([]);
  });

  test('toggle buttons expose pressed state', async ({ page }) => {
    const missing = await page.locator('#tokens .token:not([aria-pressed]), #presets .chip:not([aria-pressed])').count();
    expect(missing).toBe(0);
  });
});
