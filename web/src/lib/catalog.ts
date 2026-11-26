import type { Product } from './api';

export type Category = { id: string; title: string };

export const CATEGORIES: Category[] = [
  { id: 'skincare', title: 'Уход за кожей' },
  { id: 'makeup', title: 'Макияж' },
  { id: 'hair', title: 'Уход за волосами' },
  { id: 'food', title: 'Продукты и напитки' },
  { id: 'home', title: 'Дом и быт' },
];

export type CatalogMeta = {
  price: number;
  oldPrice?: number;
  category: string;
  brand: string;
  volume: string;
  rating: number;
  reviews: number;
  description: string;
  bullets: string[];
  badge?: string;
};

export type SeedProduct = CatalogMeta & {
  sku: string;
  name: string;
  in_stock: number;
};

// Товары, которые создаются в бэкенде сид-скриптом backend/seed.ts
export const SEED: SeedProduct[] = [
  {
    sku: 'MS-SKIN-001',
    name: 'Увлажняющий крем с центеллой',
    price: 2390,
    oldPrice: 2990,
    in_stock: 24,
    category: 'skincare',
    brand: 'Miroy Botanical',
    volume: '50 мл',
    rating: 5,
    reviews: 128,
    badge: 'Хит',
    description:
      'Лёгкий увлажняющий крем на основе экстракта центеллы азиатской и гиалуроновой кислоты. Восстанавливает защитный барьер кожи, успокаивает покраснения и подходит для ежедневного ухода.',
    bullets: [
      '81% экстракта центеллы азиатской',
      'Гиалуроновая кислота трёх молекулярных весов',
      'Без парабенов и искусственных красителей',
      'Дерматологически протестирован',
    ],
  },
  {
    sku: 'MS-SKIN-002',
    name: 'Сыворотка с ниацинамидом 10%',
    price: 1850,
    oldPrice: 2200,
    in_stock: 31,
    category: 'skincare',
    brand: 'Miroy Lab',
    volume: '30 мл',
    rating: 4,
    reviews: 94,
    badge: 'Новинка',
    description:
      'Концентрированная сыворотка с 10% ниацинамида выравнивает тон кожи, сужает поры и снижает выраженность пигментных пятен. Быстро впитывается, не оставляет липкости.',
    bullets: [
      '10% ниацинамида и 1% цинка',
      'Выравнивает тон и сужает поры',
      'Подходит для комбинированной кожи',
      'Не содержит отдушек',
    ],
  },
  {
    sku: 'MS-SKIN-003',
    name: 'Гидрогелевые патчи для глаз',
    price: 990,
    in_stock: 46,
    category: 'skincare',
    brand: 'Miroy Botanical',
    volume: '60 шт.',
    rating: 4,
    reviews: 156,
    description:
      'Охлаждающие гидрогелевые патчи с экстрактом зелёного чая снимают отёчность и освежают кожу вокруг глаз. Удобны для утреннего ухода перед макияжем.',
    bullets: [
      'Экстракт зелёного чая и кофеин',
      'Заметно уменьшают отёчность',
      'Плотно прилегают к коже',
      '60 пар в упаковке',
    ],
  },
  {
    sku: 'MS-MAKE-001',
    name: 'Тинт для губ с матовым финишем',
    price: 1290,
    oldPrice: 1590,
    in_stock: 18,
    category: 'makeup',
    brand: 'Miroy Color',
    volume: '4 г',
    rating: 5,
    reviews: 112,
    badge: 'Скидка 19%',
    description:
      'Стойкий тинт с лёгкой текстурой и насыщенным цветом. Держится до 8 часов, не сушит губы и не оставляет следов на чашке.',
    bullets: [
      'Стойкость до 8 часов',
      'Насыщенный матовый финиш',
      'Не сушит губы',
      'Оттенок «Сеул» — тёплый розовый',
    ],
  },
];

// Дополнительный ассортимент: создаётся из панели администратора
// (POST /products/create) с ценой из этих метаданных.
export const EXTRA: Record<string, CatalogMeta> = {
  'MS-MAKE-002': {
    price: 2790,
    category: 'makeup',
    brand: 'Miroy Color',
    volume: '15 г × 2',
    rating: 4,
    reviews: 73,
    badge: 'Хит',
    description:
      'Тональный кушон с защитой SPF 50+ PA+++ создаёт естественное сияющее покрытие и выравнивает тон. В комплекте сменный рефил.',
    bullets: [
      'Защита SPF 50+ / PA+++',
      'Сменный рефил в комплекте',
      'Естественное сияющее покрытие',
      'Средняя плотность, легко наслаивается',
    ],
  },
  'MS-HAIR-001': {
    price: 1390,
    oldPrice: 1690,
    category: 'hair',
    brand: 'Miroy Herbal',
    volume: '500 мл',
    rating: 4,
    reviews: 64,
    description:
      'Травяной шампунь с экстрактом женьшеня укрепляет корни, уменьшает выпадение и придаёт объём у корней.',
    bullets: [
      'Экстракт женьшеня и репейника',
      'Уменьшает выпадение волос',
      'Придаёт объём у корней',
      'Без сульфатов',
    ],
  },
  'MS-FOOD-001': {
    price: 690,
    category: 'food',
    brand: 'Miroy Tea Garden',
    volume: '20 пак.',
    rating: 5,
    reviews: 88,
    description:
      'Свежий зелёный чай с цветками жасмина из плантаций на юге Кореи. Деликатный цветочный аромат и мягкий вкус без горечи.',
    bullets: [
      'Корейский чайный лист',
      'Натуральный жасминовый цвет',
      '20 индивидуальных пакетиков',
      'Без ароматизаторов',
    ],
  },
  'MS-HOME-001': {
    price: 1590,
    category: 'home',
    brand: 'Miroy Home',
    volume: '180 г',
    rating: 4,
    reviews: 41,
    description:
      'Соевая свеча в керамическом стакане с тёплым древесным ароматом сандала и кедра. Время горения — около 40 часов.',
    bullets: [
      '100% соевый воск',
      'Время горения до 40 часов',
      'Керамический стакан ручной работы',
      'Хлопковый фитиль без свинца',
    ],
  },
};

export const EXTRA_NAMES: Record<string, string> = {
  'MS-MAKE-002': 'Кушон с SPF 50+',
  'MS-HAIR-001': 'Шампунь для укрепления волос',
  'MS-FOOD-001': 'Холодный зелёный чай с жасмином',
  'MS-HOME-001': 'Ароматическая свеча «Сандал и кедр»',
};

const KNOWN: Record<string, CatalogMeta> = {
  ...Object.fromEntries(SEED.map(({ sku, ...meta }) => [sku, meta])),
  ...EXTRA,
};

const PALETTE = ['#dce9d5', '#e7e2f3', '#f3dcdc', '#dfe9ef', '#ece0d4', '#e2eddc', '#f0e6d8'];
const PALETTE_OF: Record<string, string> = {
  'MS-SKIN-001': '#dce9d5',
  'MS-SKIN-002': '#e7e2f3',
  'MS-SKIN-003': '#dfe9ef',
  'MS-MAKE-001': '#f3dcdc',
  'MS-MAKE-002': '#f0e6d8',
  'MS-HAIR-001': '#e2eddc',
  'MS-FOOD-001': '#dbe8da',
  'MS-HOME-001': '#ece0d4',
};

export type CatalogItem = Product & CatalogMeta & { tint: string };

/** Собирает карточку из ответа бэкенда, цены (history из localStorage) и метаданных каталога. */
export function toCatalogItem(product: Product, prices: Record<string, number>): CatalogItem {
  const meta = KNOWN[product.sku];
  const index = product.sku.length % PALETTE.length;
  return {
    ...product,
    price: prices[product.sku] ?? meta?.price ?? 0,
    oldPrice: meta?.oldPrice,
    category: meta?.category ?? 'other',
    brand: meta?.brand ?? 'Miroy Shop',
    volume: meta?.volume ?? '—',
    rating: meta?.rating ?? 5,
    reviews: meta?.reviews ?? 0,
    description: meta?.description ?? 'Подробное описание этого товара скоро появится.',
    bullets: meta?.bullets ?? [],
    badge: meta?.badge,
    tint: PALETTE_OF[product.sku] ?? PALETTE[index],
  };
}

export function categoryTitle(id: string): string {
  return CATEGORIES.find((c) => c.id === id)?.title ?? 'Разное';
}

export const FEATURES = [
  { title: 'Доставка по России', text: 'Бесплатно от 5 000 ₽', icon: 'box' },
  { title: 'Лёгкий возврат', text: '14 дней на возврат', icon: 'cycle' },
  { title: 'Безопасная оплата', text: 'Данные защищены', icon: 'lock' },
  { title: 'Поддержка 24/7', text: 'Поможем с выбором', icon: 'headset' },
] as const;
