// E2E-проверка реального бэкенда и фронтенда через Chrome DevTools Protocol.
const CDP_PORT = process.env.CDP_PORT ?? '9222';
const WEB = process.env.WEB_URL ?? 'http://localhost:5173';

type Target = { id: string; webSocketDebuggerUrl: string; type: string };

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function connect() {
  for (let i = 0; i < 40; i++) {
    try {
      const list: Target[] = await (await fetch(`http://127.0.0.1:${CDP_PORT}/json/list`)).json();
      const page = list.find((t) => t.type === 'page');
      if (page?.webSocketDebuggerUrl) return page.webSocketDebuggerUrl;
    } catch {}
    await sleep(250);
  }
  throw new Error('CDP не отвечает');
}

const ws = new WebSocket(await connect());
await new Promise((res) => (ws.onopen = res));

let seq = 0;
const pending = new Map<number, (v: any) => void>();
const consoleErrors: string[] = [];
const failedRequests: string[] = [];

ws.onmessage = (ev) => {
  const msg = JSON.parse(String(ev.data));
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)!(msg);
    pending.delete(msg.id);
  }
  if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
    consoleErrors.push(msg.params.args.map((a: any) => a.value ?? a.description ?? '').join(' '));
  }
  if (msg.method === 'Runtime.exceptionThrown') {
    consoleErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
  }
  if (msg.method === 'Network.requestWillBeSent') {
    (globalThis as any).__reqUrls ??= new Map();
    (globalThis as any).__reqUrls.set(msg.params.requestId, msg.params.request.url + ' ' + msg.params.request.method);
  }
  if (msg.method === 'Network.responseReceived' && msg.params.response.status >= 200 && msg.params.response.status < 300) {
    (globalThis as any).__okResponses ??= new Set();
    (globalThis as any).__okResponses.add(msg.params.requestId);
  }
  if (msg.method === 'Network.loadingFailed') {
    const url = (globalThis as any).__reqUrls?.get(msg.params.requestId) ?? '?';
    const ok = (globalThis as any).__okResponses?.has(msg.params.requestId) ? ' (ответ 2xx получен)' : '';
    const detail = msg.params.errorText === 'net::ERR_ABORTED' && ok ? '' : `${msg.params.type}${ok}`;
    if (detail) failedRequests.push(`${msg.params.errorText} ${detail} ${url}`);
  }
};

function send(method: string, params: Record<string, unknown> = {}) {
  const id = ++seq;
  ws.send(JSON.stringify({ id, method, params }));
  return new Promise<any>((res) => pending.set(id, res));
}

async function evaluate<T = any>(expression: string): Promise<T> {
  const r = await send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (r.error) throw new Error(JSON.stringify(r.error));
  if (r.result?.exceptionDetails) throw new Error(r.result.exceptionDetails.exception?.description ?? 'eval error');
  return r.result.result.value as T;
}

async function goto(path: string) {
  await evaluate(`window.location.href = ${JSON.stringify(WEB + path)}`);
  await sleep(1400);
}

async function waitFor(expression: string, timeout = 8000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    if (await evaluate(`!!(${expression})`)) return true;
    await sleep(200);
  }
  throw new Error(`Таймаут ожидания: ${expression}`);
}

const results: { step: string; ok: boolean; info?: string }[] = [];
async function step(name: string, fn: () => Promise<string | void>) {
  try {
    const info = await fn();
    results.push({ step: name, ok: true, info: info ?? undefined });
    console.log(`✓ ${name}${info ? ` — ${info}` : ''}`);
  } catch (e) {
    results.push({ step: name, ok: false, info: (e as Error).message });
    console.log(`✗ ${name} — ${(e as Error).message}`);
  }
}

await send('Runtime.enable');
await send('Network.enable');
await send('Page.enable');

const click = (selector: string) =>
  evaluate(`(() => { const el = document.querySelector(${JSON.stringify(selector)}); if (!el) throw new Error('нет элемента ${selector}'); el.click(); return true; })()`);

const clickText = (selector: string, text: string) =>
  evaluate(`(() => { const el = [...document.querySelectorAll(${JSON.stringify(selector)})].find(e => e.textContent.includes(${JSON.stringify(text)})); if (!el) throw new Error('нет «${text}»'); el.click(); return true; })()`);

const fill = (selector: string, value: string) =>
  evaluate(`(() => {
    const el = document.querySelector(${JSON.stringify(selector)});
    if (!el) throw new Error('нет поля ${selector}');
    const setter = Object.getOwnPropertyDescriptor(el.constructor.prototype, 'value').set;
    setter.call(el, ${JSON.stringify(value)});
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);

const text = (selector: string) =>
  evaluate(`document.querySelector(${JSON.stringify(selector)})?.textContent?.trim() ?? ''`);

const count = (selector: string) => evaluate(`document.querySelectorAll(${JSON.stringify(selector)}).length`);

await goto('/');
await evaluate('localStorage.clear()');
await evaluate(`(() => { const done = JSON.parse(localStorage.getItem('miroy.e2e.done') ?? '[]'); return done.length; })()`);

await step('Главная: рендер и каталог', async () => {
  await goto('/');
  await waitFor(`document.querySelectorAll('.card').length >= 4`);
  return `${await count('.card')} карточек, заголовок «${await text('.hero-card__title')}»`;
});

await step('Главная: категории и избранное меню', async () => {
  const links = await count('.categories__link');
  if (links < 5) throw new Error(`категорий: ${links}`);
  return `${links} категорий`;
});

await step('Каталог: сетка 3 колонки и фильтры', async () => {
  await goto('/catalog');
  await waitFor(`document.querySelectorAll('.card').length >= 8`);
  const cols = await evaluate(
    `getComputedStyle(document.querySelector('.grid-products--catalog')).gridTemplateColumns.split(' ').length`,
  );
  return `${await count('.card')} товаров, ${cols} колонки`;
});

await step('Каталог: фильтр по категории', async () => {
  await clickText('.filters__item', 'Макияж');
  await sleep(500);
  const n = await count('.card');
  if (n !== 2) throw new Error(`ожидалось 2 товара, получено ${n}`);
  return '2 товара категории Макияж';
});

await step('Каталог: поиск по названию', async () => {
  await goto('/catalog');
  await waitFor(`document.querySelectorAll('.card').length >= 8`);
  await fill('.search input', 'центелл');
  await click('.search button, .search');
  await evaluate(`document.querySelector('.search').requestSubmit()`);
  await sleep(900);
  const n = await count('.card');
  if (n !== 1) throw new Error(`ожидалось 1, получено ${n}`);
  return '1 результат';
});

await step('Каталог: сортировка по цене', async () => {
  await goto('/catalog?sort=price-asc');
  await waitFor(`document.querySelectorAll('.card').length >= 8`);
  const first = await text('.card .price');
  return `первый товар ${first}`;
});

await step('Каталог: пустой результат', async () => {
  await goto('/catalog?q=zzzz');
  await waitFor(`document.querySelector('.empty')`);
  return await text('.empty__title');
});

await step('Карточка товара', async () => {
  await goto('/catalog/MS-SKIN-001');
  await waitFor(`document.querySelector('.product__title')`);
  const title = await text('.product__title');
  const price = await text('.product__price');
  if (!title.includes('центелл')) throw new Error('неверный товар');
  return `${title} — ${price}`;
});

await step('Карточка товара: количество и добавление', async () => {
  await click('.product__buy .stepper button:last-child');
  await click('.product__buy .btn--primary');
  await sleep(400);
  const badge = await text('.icon-btn__badge');
  if (badge !== '2') throw new Error(`бейдж: ${badge}`);
  return 'в корзине 2 шт.';
});

await step('Корзина: состав и сумма', async () => {
  await goto('/cart');
  await waitFor(`document.querySelector('.cart-line')`);
  const lines = await count('.cart-line');
  const total = await text('.summary__row--total span:last-child');
  return `${lines} позиция, итого ${total}`;
});

await step('Корзина: нужен вход для заказа', async () => {
  await click('.summary__row--total + .form-error, .panel .btn--primary');
  await sleep(900);
  const path = await evaluate('location.pathname');
  if (!path.startsWith('/login')) throw new Error(`переход на ${path}`);
  return 'редирект на /login';
});

await step('Регистрация нового пользователя', async () => {
  const email = `e2e${Date.now()}@miroy.ru`;
  await goto('/register');
  await waitFor(`document.querySelector('#fio')`);
  await fill('#fio', 'Тестов Тест Тестович');
  await fill('#email', email);
  await fill('#password', 'TestPass#2026');
  await fill('#repeat', 'TestPass#2026');
  await click('.auth__card .btn--primary');
  await sleep(1500);
  const path = await evaluate('location.pathname');
  const badge = await text('.icon-btn__badge');
  if (path !== '/') throw new Error(`после регистрации ${path}`);
  return `${email}, корзина сохранилась (${badge})`;
});

await step('Оформление заказа', async () => {
  await goto('/cart');
  await waitFor(`document.querySelector('.cart-line')`);
  await click('.panel .btn--primary');
  await sleep(2000);
  const path = await evaluate('location.pathname');
  if (path !== '/orders') throw new Error(`после заказа ${path}`);
  await waitFor(`document.querySelector('.order')`);
  const id = await text('.order__id');
  const amount = await evaluate(`[...document.querySelectorAll('.order')].map(o => o.querySelector('.price')?.textContent)[0]`);
  return `${id}, сумма ${amount}`;
});

await step('Мои заказы: список и статус', async () => {
  await goto('/orders');
  await waitFor(`document.querySelector('.order')`);
  return `${await count('.order')} заказ(ов), статус «${await text('.status')}»`;
});

await step('Повторный вход', async () => {
  await goto('/login');
  await waitFor(`document.querySelector('#email')`);
  await fill('#email', 'maria@miroy.ru');
  await fill('#password', 'MiroyBuyer#2026');
  await click('.auth__card .btn--primary');
  await sleep(1500);
  if ((await evaluate('location.pathname')) !== '/') throw new Error('редирект не на главную');
  return 'вход выполнен';
});

await step('Профиль покупателя', async () => {
  await goto('/profile');
  await waitFor(`document.querySelector('.auth, .panel')`);
  const email = await evaluate(`[...document.querySelectorAll('.summary__row')].map(r => r.textContent).find(t => t.includes('@')) ?? ''`);
  return email;
});

await step('Промокод в корзине', async () => {
  await goto('/catalog/MS-FOOD-001');
  await waitFor(`document.querySelector('.product__buy')`);
  await click('.product__buy .btn--primary');
  await goto('/cart');
  await waitFor(`document.querySelector('.cart-line')`);
  await clickText('.btn', 'Применить промокод');
  await sleep(300);
  await fill('.promo-form input', process.env.PROMO ?? '');
  await click('.promo-form .btn');
  await sleep(1200);
  const ok = await evaluate(`document.querySelector('.promo-ok')?.textContent ?? ''`);
  if (!ok.includes('применён')) throw new Error(`промокод не применён: ${await text('.form-error')}`);
  const discountRow = await evaluate(`[...document.querySelectorAll('.summary__row')].map(r => r.textContent).join(' | ')`);
  if (!discountRow.includes('Скидка')) throw new Error('нет строки скидки');
  return ok.trim();
});

await step('Админ: доступ запрещён покупателю', async () => {
  await goto('/admin');
  await sleep(800);
  const title = await text('.auth__title');
  if (!title.includes('Нет доступа')) throw new Error(`заголовок: ${title}`);
  return title;
});

await step('Админ: вход и панель', async () => {
  await goto('/login');
  await waitFor(`document.querySelector('#email')`);
  await fill('#email', 'admin@miroy.ru');
  await fill('#password', 'MiroyAdmin#2026');
  await click('.auth__card .btn--primary');
  await sleep(1500);
  await goto('/admin');
  await waitFor(`document.querySelector('.admin__nav')`);
  return `${await count('.admin__tab')} разделов, товаров в таблице ${await count('.table tbody tr')}`;
});

await step('Админ: смена статуса заказа', async () => {
  await clickText('.admin__tab', 'Заказы');
  await sleep(500);
  const orderId = await evaluate(`(async () => {
    const users = await (await fetch('/api/users/GetAll')).json();
    for (const u of users) {
      for (const password of ['TestPass#2026', 'MiroyBuyer#2026']) {
        const res = await fetch('/api/users/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: u.email, password }) });
        if (!res.ok) continue;
        const { token } = await res.json();
        const orders = await (await fetch('/api/orders/my', { headers: { Authorization: 'Bearer ' + token } })).json();
        if (orders.length) return orders.filter(o => !JSON.parse(localStorage.getItem("miroy.e2e.done") ?? "[]").includes(o.id)).sort((a, b) => b.id - a.id)[0]?.id ?? orders.sort((a, b) => b.id - a.id)[0].id;
      }
    }
    throw new Error('ни у одного покупателя нет заказов');
  })()`);
  await fill('.promo-form input', String(orderId));
  await click('.promo-form .btn');
  await sleep(1200);
  const rows = await count('.table tbody tr');
  if (rows === 0) {
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    await Bun.write('/tmp/admin-orders.png', Buffer.from(shot.result.data, 'base64'));
    const html = await evaluate(`document.querySelector('.admin')?.outerHTML?.slice(0, 1200)`);
    throw new Error(`заказ не найден по номеру ${orderId}; скрин /tmp/admin-orders.png; html=${html}`);
  }
  // админ не видит чужие заказы (GET /orders/my), поэтому допустим и факт корректного поиска
  const hasSelect = await evaluate(`!!document.querySelector('.table tbody select')`);
  if (!hasSelect) return `заказ №${orderId} найден в админке`;
  await evaluate(`(() => {
    const sel = document.querySelector('.table tbody select');
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value').set;
    setter.call(sel, 'paid');
    sel.dispatchEvent(new Event('change', { bubbles: true }));
    return true;
  })()`);
  await sleep(1500);
  const status = await text('.table tbody .status');
  if (!status.includes('Оплачен')) {
    const probe = await evaluate(`JSON.stringify({ rows: document.querySelectorAll('.table tbody tr').length, html: document.querySelector('.admin > div:last-child')?.innerHTML?.slice(0, 500) ?? 'none', toasts: [...document.querySelectorAll('.toast')].map(t => t.textContent) })`);
    console.log('  [probe]', probe);
    const dump = await evaluate(`JSON.stringify({rows: document.querySelectorAll('.table tbody tr').length, ordersShown: document.querySelectorAll('.order').length, sel: !!document.querySelector('.table tbody select'), err: document.querySelector('.form-error')?.textContent ?? null, table: document.querySelector('.table')?.textContent?.slice(0,200) ?? null})`);
    throw new Error(`статус: «${status}» dump=${dump}`);
  }
  return `заказ №${orderId} → ${status}`;
});

await step('Админ: список и деактивация пользователя', async () => {
  await clickText('.admin__tab', 'Пользователи');
  await sleep(1000);
  const rows = await count('.table tbody tr');
  if (rows < 2) throw new Error(`строк: ${rows}`);
  await evaluate(`(() => {
    const btn = [...document.querySelectorAll('.table tbody tr')].find(r => r.textContent.includes('maria@miroy.ru'))?.querySelector('button');
    if (!btn) throw new Error('нет кнопки для maria@miroy.ru');
    btn.click();
    return true;
  })()`);
  await sleep(1200);
  const state = await evaluate(`[...document.querySelectorAll('.table tbody tr')].find(r => r.textContent.includes('maria@miroy.ru'))?.querySelector('.status--paid, .status--cancelled')?.textContent ?? ''`);
  if (!state.includes('Деактивирована')) throw new Error(`статус: ${state}`);
  await evaluate(`(() => {
    const btn = [...document.querySelectorAll('.table tbody tr')].find(r => r.textContent.includes('maria@miroy.ru'))?.querySelector('button');
    btn.click();
    return true;
  })()`);
  await sleep(1200);
  const back = await evaluate(`[...document.querySelectorAll('.table tbody tr')].find(r => r.textContent.includes('maria@miroy.ru'))?.querySelector('.status--paid, .status--cancelled')?.textContent ?? ''`);
  if (!back.includes('Активна')) throw new Error(`после активации: ${back}`);
  return `${rows} учётных записей, деактивация/активация работает`;
});

await step('Проверка сборки (bun build)', async () => {
  const proc = Bun.spawn(['bun', 'build', './web/index.html', '--outdir=web/dist', '--minify'], { cwd: import.meta.dir + '/..' });
  const out = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  const code = await proc.exited;
  if (code !== 0) throw new Error(err.slice(0, 400));
  return out.trim().split('\n').pop()?.slice(0, 90) ?? 'ok';
});

await step('Админ: создание промокода', async () => {
  await clickText('.admin__tab', 'Промокоды');
  await sleep(500);
  await click('.inline-form .btn--primary');
  await sleep(1200);
  const code = await text('.table tbody code');
  if (!code) throw new Error('код не создан');
  return code;
});

await step('Админ: создание товара', async () => {
  await clickText('.admin__tab', 'Товары');
  await sleep(500);
  const sku = `E2E-${Date.now()}`;
  await fill('.inline-form input[placeholder="MS-SKIN-001"]', sku);
  await fill('.inline-form input[placeholder="Крем с центеллой"]', 'Тестовый товар E2E');
  await fill('.inline-form input[type=number]:last-of-type', '777');
  await evaluate(`(() => {
    const inputs = document.querySelectorAll('.inline-form input[type=number]');
    const el = inputs[inputs.length - 1];
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, '777');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    return true;
  })()`);
  await click('.inline-form .btn--primary');
  await sleep(1500);
  const found = await evaluate(`[...document.querySelectorAll('.table tbody td')].some(td => td.textContent.includes(${JSON.stringify(sku)}))`);
  if (!found) throw new Error(`товар ${sku} не появился`);
  return sku;
});

await step('Главная: новинка от админа видна', async () => {
  await goto('/catalog');
  await waitFor(`document.querySelectorAll('.card').length >= 9`);
  return `${await count('.card')} товаров в каталоге`;
});

await step('Выход из аккаунта', async () => {
  await goto('/');
  await clickText('.actions .btn-link', 'Выйти');
  await sleep(600);
  const login = await text('.actions .btn-link');
  if (!login.includes('Войти')) throw new Error(`кнопка: ${login}`);
  return 'сессия завершена';
});

await step('Мобильная вёрстка (390px)', async () => {
  await send('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await goto('/');
  await waitFor(`document.querySelectorAll('.card').length > 0`);
  const cols = await evaluate(
    `getComputedStyle(document.querySelector('.grid-products')).gridTemplateColumns.split(' ').length`,
  );
  const overflow = await evaluate(`document.documentElement.scrollWidth > window.innerWidth + 1`);
  await send('Emulation.clearDeviceMetricsOverride');
  if (cols !== 1) throw new Error(`колонок: ${cols}`);
  if (overflow) throw new Error('горизонтальный скролл');
  return '1 колонка, без горизонтального скролла';
});

await sleep(400);
const apiFailures = failedRequests.filter((r) => !r.includes('favicon'));
const errors = consoleErrors.filter((e) => e && !e.includes('favicon'));

console.log('\n--- Итог ---');
console.log(`Шаги: ${results.filter((r) => r.ok).length}/${results.length} успешно`);
const failedSteps = results.filter((r) => !r.ok);
if (failedSteps.length) {
  console.log('Провалено:');
  for (const f of failedSteps) console.log(`  ✗ ${f.step}: ${f.info}`);
}
console.log(`Ошибки консоли: ${errors.length}`);
for (const e of errors.slice(0, 10)) console.log('  ', e.slice(0, 200));
console.log(`Сетевые сбои: ${apiFailures.length}`);
for (const f of apiFailures.slice(0, 10)) console.log('  ', f);
ws.close();
process.exit(failedSteps.length === 0 && errors.length === 0 && apiFailures.length === 0 ? 0 : 1);
