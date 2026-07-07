/* =====================================================================
   WKB HEADSHOP — Camada de dados (data.js)
   ---------------------------------------------------------------------
   Este arquivo cuida de:
   - Configurações da loja (WhatsApp, nome, etc.)
   - Catálogo inicial de produtos e categorias (sementinha)
   - Leitura/gravação no localStorage (persistência)
   - API simples usada tanto pela loja quanto pelo painel admin

   Para editar rapidamente:
   - Troque o número do WhatsApp em WKB_CONFIG.whatsapp
   - Adicione/edite os produtos padrão em DEFAULT_PRODUCTS
   O painel admin também permite editar tudo isso pelo navegador.
   ===================================================================== */

const WKB_CONFIG = {
  storeName: 'WKB Headshop',
  slogan: 'Estilo para sua brisa',
  // Número do WhatsApp que recebe os pedidos (formato internacional, só dígitos)
  // Ex.: 55 (Brasil) + DDD + número  ->  5511999999999
  whatsapp: '5511999999999',
  currency: 'R$',
};

/* Categorias padrão. O "icon" define a ilustração SVG do card. */
const DEFAULT_CATEGORIES = [
  { id: 'kits-estojo', name: 'Kits com Estojo', icon: 'tray' },
  { id: 'kits-bandeja', name: 'Kits com Bandeja', icon: 'tray' },
];

/* Catálogo inicial com produtos reais da WKB Headshop.
   status: 'disponivel' ou 'esgotado'.
   image: caminho da foto real do produto (deixe vazio para usar
          a ilustração neon da categoria). */
const DEFAULT_PRODUCTS = [
  {
    id: 'p1',
    name: 'Kit Estojo Vermelho',
    category: 'kits-estojo',
    description: 'Estojo antiodor completo com sedas, dichavador, piteira, filtros e acessórios. Tema vermelho/azul.',
    price: 105,
    status: 'disponivel',
    image: 'assets/products/kit-vermelho.jpg',
    icon: 'tray',
  },
  {
    id: 'p2',
    name: 'Kit Estojo Red Smoking',
    category: 'kits-estojo',
    description: 'Estojo com sedas Smoking/Elite, dichavador, isqueiro e potinho de silicone. Tema vermelho.',
    price: 110,
    status: 'disponivel',
    image: 'assets/products/kit-red-smoking.jpg',
    icon: 'tray',
  },
  {
    id: 'p3',
    name: 'Kit Bandeja Papelito',
    category: 'kits-bandeja',
    description: 'Bandeja Papelito + sedas Smoking/Zomo, dichavador, isqueiro e piteira. Kit completo pra montar.',
    price: 115,
    status: 'disponivel',
    image: 'assets/products/kit-bandeja-papelito.jpg',
    icon: 'tray',
  },
  {
    id: 'p4',
    name: 'Kit Estojo Verde',
    category: 'kits-estojo',
    description: 'Estojo antiodor com sedas King Size, dichavador, piteira e potinho de silicone. Tema verde.',
    price: 130,
    status: 'disponivel',
    image: 'assets/products/kit-verde.jpg',
    icon: 'tray',
  },
  {
    id: 'p5',
    name: 'Kit Premium Papelito Onça',
    category: 'kits-bandeja',
    description: 'Bandeja Papelito Onça + estojo, sedas OCB/Zomo, piteira Sadhu, tesoura e dichavador. Edição premium.',
    price: 180,
    status: 'disponivel',
    image: 'assets/products/kit-papelito-onca.jpg',
    icon: 'tray',
  },
  {
    id: 'p6',
    name: 'Kit Premium Barbie',
    category: 'kits-bandeja',
    description: 'Bandeja Barbie + estojo, sedas Elite/OCB, dichavador temático, piteira e acessórios. Edição premium.',
    price: 180,
    status: 'disponivel',
    image: 'assets/products/kit-barbie.jpg',
    icon: 'tray',
  },
];

/* ---------------------------------------------------------------------
   Storage: chaves e helpers
   ------------------------------------------------------------------- */
const STORAGE_KEYS = {
  products: 'wkb_products',
  categories: 'wkb_categories',
  cart: 'wkb_cart',
  version: 'wkb_data_version',
};

/* Sempre que o catálogo padrão (DEFAULT_PRODUCTS/CATEGORIES) mudar aqui no
   código, aumente este número. Isso faz a loja recarregar o catálogo novo
   para quem já visitou o site antes. */
const DATA_VERSION = '2';

const WKBStore = {
  /* Garante que o localStorage tenha os dados iniciais.
     Na primeira visita, ou quando DATA_VERSION muda, recarrega o
     catálogo padrão definido neste arquivo. */
  init() {
    const version = localStorage.getItem(STORAGE_KEYS.version);
    const hasProducts = !!localStorage.getItem(STORAGE_KEYS.products);
    if (!hasProducts || version !== DATA_VERSION) {
      localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(DEFAULT_PRODUCTS));
      localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify([]));
      localStorage.setItem(STORAGE_KEYS.version, DATA_VERSION);
    }
  },

  /* ------- Produtos ------- */
  getProducts() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.products)) || [];
    } catch (e) {
      return [];
    }
  },
  saveProducts(list) {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(list));
  },
  getProduct(id) {
    return this.getProducts().find((p) => p.id === id) || null;
  },
  addProduct(product) {
    const list = this.getProducts();
    product.id = product.id || 'p' + Date.now();
    list.push(product);
    this.saveProducts(list);
    return product;
  },
  updateProduct(id, patch) {
    const list = this.getProducts();
    const idx = list.findIndex((p) => p.id === id);
    if (idx > -1) {
      list[idx] = { ...list[idx], ...patch };
      this.saveProducts(list);
      return list[idx];
    }
    return null;
  },
  deleteProduct(id) {
    this.saveProducts(this.getProducts().filter((p) => p.id !== id));
  },

  /* ------- Categorias ------- */
  getCategories() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.categories)) || [];
    } catch (e) {
      return [];
    }
  },
  saveCategories(list) {
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(list));
  },
  getCategory(id) {
    return this.getCategories().find((c) => c.id === id) || null;
  },
  categoryName(id) {
    const c = this.getCategory(id);
    return c ? c.name : 'Sem categoria';
  },
  addCategory(cat) {
    const list = this.getCategories();
    cat.id = cat.id || 'c' + Date.now();
    cat.icon = cat.icon || 'tray';
    list.push(cat);
    this.saveCategories(list);
    return cat;
  },
  deleteCategory(id) {
    this.saveCategories(this.getCategories().filter((c) => c.id !== id));
  },

  /* ------- Carrinho ------- */
  getCart() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.cart)) || [];
    } catch (e) {
      return [];
    }
  },
  saveCart(cart) {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  },

  /* ------- Utilidades ------- */
  formatPrice(value) {
    return WKB_CONFIG.currency + ' ' + Number(value).toFixed(2).replace('.', ',');
  },
  resetToDefaults() {
    localStorage.setItem(STORAGE_KEYS.products, JSON.stringify(DEFAULT_PRODUCTS));
    localStorage.setItem(STORAGE_KEYS.categories, JSON.stringify(DEFAULT_CATEGORIES));
  },
};

/* Ilustrações SVG por tipo (usadas quando o produto não tem foto).
   São desenhos vetoriais limpos — nada de fotos falsas. */
const WKB_ICONS = {
  seda(color) {
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="24" y="30" width="72" height="60" rx="6" fill="none" stroke="${color}" stroke-width="4"/>
      <line x1="24" y1="48" x2="96" y2="48" stroke="${color}" stroke-width="3"/>
      <line x1="60" y1="30" x2="60" y2="90" stroke="${color}" stroke-width="3" opacity="0.6"/>
      <circle cx="42" cy="69" r="4" fill="${color}"/>
      <circle cx="78" cy="69" r="4" fill="${color}"/>
    </svg>`;
  },
  bong(color) {
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M52 22 h16 v34 l14 34 a8 8 0 0 1 -8 10 H46 a8 8 0 0 1 -8 -10 l14 -34 z"
        fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>
      <line x1="52" y1="34" x2="68" y2="34" stroke="${color}" stroke-width="3"/>
      <path d="M78 60 l14 -8" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <circle cx="60" cy="88" r="6" fill="${color}" opacity="0.5"/>
    </svg>`;
  },
  grinder(color) {
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="60" cy="46" rx="34" ry="12" fill="none" stroke="${color}" stroke-width="4"/>
      <path d="M26 46 v22 a34 12 0 0 0 68 0 v-22" fill="none" stroke="${color}" stroke-width="4"/>
      <line x1="42" y1="42" x2="42" y2="50" stroke="${color}" stroke-width="3"/>
      <line x1="60" y1="40" x2="60" y2="52" stroke="${color}" stroke-width="3"/>
      <line x1="78" y1="42" x2="78" y2="50" stroke="${color}" stroke-width="3"/>
    </svg>`;
  },
  lighter(color) {
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="44" y="46" width="32" height="48" rx="6" fill="none" stroke="${color}" stroke-width="4"/>
      <rect x="50" y="38" width="12" height="10" fill="none" stroke="${color}" stroke-width="3"/>
      <path d="M66 40 q10 -14 0 -22 q6 12 -4 12 q8 6 4 10 z" fill="${color}"/>
    </svg>`;
  },
  bowl(color) {
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M36 54 a24 24 0 0 0 48 0 z" fill="none" stroke="${color}" stroke-width="4" stroke-linejoin="round"/>
      <path d="M60 54 v18" stroke="${color}" stroke-width="4"/>
      <path d="M60 72 l16 10" stroke="${color}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="60" cy="54" rx="24" ry="7" fill="none" stroke="${color}" stroke-width="3"/>
    </svg>`;
  },
  tray(color) {
    return `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="26" y="44" width="68" height="40" rx="8" fill="none" stroke="${color}" stroke-width="4"/>
      <rect x="38" y="56" width="20" height="16" rx="3" fill="none" stroke="${color}" stroke-width="3"/>
      <line x1="66" y1="58" x2="84" y2="58" stroke="${color}" stroke-width="3"/>
      <line x1="66" y1="70" x2="84" y2="70" stroke="${color}" stroke-width="3"/>
    </svg>`;
  },
};

/* Cores neon rotativas para dar variedade aos cards sem foto. */
const WKB_NEON_COLORS = ['#39FF14', '#B026FF', '#00E5FF', '#FFE600', '#FF6B00'];

function wkbIconFor(product, index = 0) {
  const color = WKB_NEON_COLORS[index % WKB_NEON_COLORS.length];
  const key = product.icon && WKB_ICONS[product.icon] ? product.icon : 'tray';
  return WKB_ICONS[key](color);
}
