/* =====================================================================
   WKB HEADSHOP — Lógica da loja (store.js)
   - Roteamento por hash (#home, #produtos, ...)
   - Renderização de categorias e produtos
   - Carrinho (adicionar, quantidade, total)
   - Checkout: retirada/entrega + mensagem pronta para WhatsApp
   ===================================================================== */

(function () {
  'use strict';

  WKBStore.init();

  // Estado do carrinho: [{ id, qty }]
  let cart = WKBStore.getCart();
  let currentFilter = 'todas';

  /* ---------- Helpers ---------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  function toast(msg) {
    const wrap = $('#toastWrap');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function productThumb(product, index = 0) {
    if (product.image) {
      return `<img src="${escapeAttr(product.image)}" alt="${escapeAttr(product.name)}" loading="lazy"
        onerror="this.style.display='none'" />`;
    }
    return wkbIconFor(product, index);
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  /* =====================================================================
     ROTEAMENTO
     ===================================================================== */
  const ROUTES = ['home', 'produtos', 'sobre', 'como-comprar', 'carrinho', 'contato'];

  function router() {
    let route = (location.hash || '#home').replace('#', '');
    if (!ROUTES.includes(route)) route = 'home';

    $$('.page').forEach((p) => p.classList.remove('active'));
    const page = $('#page-' + route);
    if (page) page.classList.add('active');

    $$('.nav-links a').forEach((a) => {
      a.classList.toggle('active', a.getAttribute('data-route') === route);
    });

    // Fecha o menu mobile
    $('#navLinks').classList.remove('open');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (route === 'produtos') renderProducts();
    if (route === 'carrinho') renderCart();
    if (route === 'home') renderHome();
  }

  window.addEventListener('hashchange', router);

  /* =====================================================================
     HOME
     ===================================================================== */
  function renderHome() {
    const cats = WKBStore.getCategories();
    const products = WKBStore.getProducts();

    // Categorias
    const catWrap = $('#homeCategories');
    catWrap.innerHTML = cats
      .map((c, i) => {
        const count = products.filter((p) => p.category === c.id).length;
        const color = WKB_NEON_COLORS[i % WKB_NEON_COLORS.length];
        const icon = WKB_ICONS[c.icon] ? WKB_ICONS[c.icon](color) : WKB_ICONS.tray(color);
        const label = count === 0 ? 'Em breve 🔜' : count + (count === 1 ? ' produto' : ' produtos');
        return `<button class="cat-card" data-cat="${escapeAttr(c.id)}">
            <div class="cat-icon">${icon}</div>
            <h3>${escapeHtml(c.name)}</h3>
            <p>${label}</p>
          </button>`;
      })
      .join('');

    $$('#homeCategories .cat-card').forEach((btn) => {
      btn.addEventListener('click', () => {
        currentFilter = btn.getAttribute('data-cat');
        location.hash = '#produtos';
      });
    });

    // Destaques: até 4 produtos disponíveis
    const featured = products.filter((p) => p.status === 'disponivel').slice(0, 4);
    $('#homeFeatured').innerHTML = featured.map((p, i) => productCard(p, i)).join('');
    bindAddButtons($('#homeFeatured'));
  }

  /* =====================================================================
     PRODUTOS
     ===================================================================== */
  function renderProducts() {
    const cats = WKBStore.getCategories();
    const products = WKBStore.getProducts();

    // Filtros
    const filterWrap = $('#productFilters');
    const chips = [{ id: 'todas', name: 'Todas' }].concat(cats);
    filterWrap.innerHTML = chips
      .map(
        (c) =>
          `<button class="filter-chip ${currentFilter === c.id ? 'active' : ''}" data-filter="${escapeAttr(
            c.id
          )}">${escapeHtml(c.name)}</button>`
      )
      .join('');

    $$('#productFilters .filter-chip').forEach((chip) => {
      chip.addEventListener('click', () => {
        currentFilter = chip.getAttribute('data-filter');
        renderProducts();
      });
    });

    // Grade
    const filtered =
      currentFilter === 'todas'
        ? products
        : products.filter((p) => p.category === currentFilter);

    const grid = $('#productGrid');
    if (filtered.length === 0) {
      grid.innerHTML = `<div class="empty" style="grid-column:1/-1;">
          <h3>Em breve nesta categoria 🔜</h3>
          <p>Estamos preparando novidades aqui. Enquanto isso, confira as outras categorias.</p>
        </div>`;
      return;
    }
    grid.innerHTML = filtered.map((p, i) => productCard(p, i)).join('');
    bindAddButtons(grid);
  }

  function productCard(p, index) {
    const isOut = p.status === 'esgotado';
    const noPrice = !WKBStore.hasPrice(p.price);
    let button;
    let outMsg = '';
    if (isOut && noPrice) {
      // Esgotado e sem preço: não dá para calcular no carrinho
      button = `<button class="btn btn-ghost btn-sm" disabled>Esgotado</button>`;
      outMsg = `<p class="out-msg">🔔 Esgotado. Fale com a loja pelo WhatsApp para solicitar e aguardar reposição.</p>`;
    } else if (isOut) {
      // Esgotado com preço: cliente pode solicitar mesmo assim
      button = `<button class="btn btn-purple btn-sm add-btn" data-id="${escapeAttr(p.id)}">Solicitar mesmo assim</button>`;
      outMsg = `<p class="out-msg">🔔 Esgotado — você pode solicitar mesmo assim e aguardar a reposição. Confirmamos o prazo pelo WhatsApp.</p>`;
    } else if (noPrice) {
      button = `<button class="btn btn-ghost btn-sm" disabled>A combinar</button>`;
    } else {
      button = `<button class="btn btn-primary btn-sm add-btn" data-id="${escapeAttr(p.id)}">Adicionar</button>`;
    }
    return `<article class="product-card">
        <div class="product-media" style="color:${WKB_NEON_COLORS[index % WKB_NEON_COLORS.length]}">
          <span class="badge ${isOut ? 'esgotado' : 'disponivel'}">${isOut ? 'Esgotado' : 'Disponível'}</span>
          ${p.code ? `<span class="code-badge">${escapeHtml(p.code)}</span>` : ''}
          ${productThumb(p, index)}
        </div>
        <div class="product-body">
          <div class="product-cat">${escapeHtml(WKBStore.categoryName(p.category))}</div>
          <h3 class="product-name">${escapeHtml(p.name)}</h3>
          <p class="product-desc">${escapeHtml(p.description || '')}</p>
          ${outMsg}
          <div class="product-foot">
            <span class="product-price">${WKBStore.formatPrice(p.price)}</span>
            ${button}
          </div>
        </div>
      </article>`;
  }

  function bindAddButtons(ctx) {
    $$('.add-btn', ctx).forEach((btn) => {
      btn.addEventListener('click', () => addToCart(btn.getAttribute('data-id')));
    });
  }

  /* =====================================================================
     CARRINHO
     ===================================================================== */
  function addToCart(id) {
    const product = WKBStore.getProduct(id);
    if (!product) return;
    // Sem preço não entra no carrinho (não dá para somar)
    if (!WKBStore.hasPrice(product.price)) {
      toast('Preço a combinar — fale com a loja sobre este item.');
      return;
    }
    const isOut = product.status === 'esgotado';
    const line = cart.find((l) => l.id === id);
    if (line) line.qty += 1;
    else cart.push({ id, qty: 1 });
    persistCart();
    updateCartCount();
    toast(
      isOut
        ? product.name + ' adicionado (esgotado — sob encomenda) ✓'
        : product.name + ' adicionado ao carrinho ✓'
    );
  }

  function changeQty(id, delta) {
    const line = cart.find((l) => l.id === id);
    if (!line) return;
    line.qty += delta;
    if (line.qty <= 0) cart = cart.filter((l) => l.id !== id);
    persistCart();
    renderCart();
    updateCartCount();
  }

  function removeLine(id) {
    cart = cart.filter((l) => l.id !== id);
    persistCart();
    renderCart();
    updateCartCount();
  }

  function persistCart() {
    WKBStore.saveCart(cart);
  }

  function cartDetailed() {
    // Junta o carrinho com os dados atuais do produto (preço/nome podem ter mudado)
    return cart
      .map((line) => {
        const p = WKBStore.getProduct(line.id);
        if (!p) return null;
        return { ...p, qty: line.qty, lineTotal: p.price * line.qty };
      })
      .filter(Boolean);
  }

  function cartTotals() {
    const items = cartDetailed();
    const totalItems = items.reduce((s, i) => s + i.qty, 0);
    const totalValue = items.reduce((s, i) => s + i.lineTotal, 0);
    return { items, totalItems, totalProducts: items.length, totalValue };
  }

  function updateCartCount() {
    const { totalItems } = cartTotals();
    $('#cartCount').textContent = totalItems;
  }

  function renderCart() {
    // Remove do carrinho itens que não existem mais
    cart = cart.filter((l) => WKBStore.getProduct(l.id));
    persistCart();

    const { items, totalItems, totalProducts, totalValue } = cartTotals();
    const layout = $('#cartLayout');
    const empty = $('#cartEmpty');

    if (items.length === 0) {
      layout.style.display = 'none';
      empty.style.display = 'block';
      updateCartCount();
      return;
    }
    layout.style.display = 'grid';
    empty.style.display = 'none';

    $('#cartItems').innerHTML = items
      .map(
        (p, i) => `<div class="cart-row">
          <div class="cart-thumb" style="color:${WKB_NEON_COLORS[i % WKB_NEON_COLORS.length]}">${productThumb(
          p,
          i
        )}</div>
          <div class="cart-info">
            <h4>${escapeHtml(p.name)}</h4>
            <div class="unit">${p.code ? '<strong>' + escapeHtml(p.code) + '</strong> · ' : ''}${WKBStore.formatPrice(p.price)} • un.</div>
            ${p.status === 'esgotado' ? '<div class="cart-tag-out">🔔 Esgotado — sob encomenda</div>' : ''}
            <button class="link-remove" data-remove="${escapeAttr(p.id)}">Remover</button>
          </div>
          <div class="cart-controls">
            <div class="qty">
              <button data-dec="${escapeAttr(p.id)}" aria-label="Diminuir">−</button>
              <span>${p.qty}</span>
              <button data-inc="${escapeAttr(p.id)}" aria-label="Aumentar">+</button>
            </div>
            <div class="cart-line-total">${WKBStore.formatPrice(p.lineTotal)}</div>
          </div>
        </div>`
      )
      .join('');

    $$('[data-inc]', $('#cartItems')).forEach((b) =>
      b.addEventListener('click', () => changeQty(b.getAttribute('data-inc'), 1))
    );
    $$('[data-dec]', $('#cartItems')).forEach((b) =>
      b.addEventListener('click', () => changeQty(b.getAttribute('data-dec'), -1))
    );
    $$('[data-remove]', $('#cartItems')).forEach((b) =>
      b.addEventListener('click', () => removeLine(b.getAttribute('data-remove')))
    );

    $('#sumItems').textContent = totalItems;
    $('#sumProducts').textContent = totalProducts;
    $('#sumTotal').textContent = WKBStore.formatPrice(totalValue);
    updateCartCount();
  }

  /* =====================================================================
     CHECKOUT — retirada/entrega + WhatsApp
     ===================================================================== */
  function setupFulfillment() {
    const optRetirada = $('#optRetirada');
    const optEntrega = $('#optEntrega');
    const deliveryFields = $('#deliveryFields');
    const pickupFields = $('#pickupFields');

    function refresh() {
      const value = getFulfillment();
      optRetirada.classList.toggle('selected', value === 'retirada');
      optEntrega.classList.toggle('selected', value === 'entrega');
      deliveryFields.style.display = value === 'entrega' ? 'block' : 'none';
      pickupFields.style.display = value === 'retirada' ? 'block' : 'none';
    }

    optRetirada.addEventListener('change', refresh);
    optEntrega.addEventListener('change', refresh);
    optRetirada.addEventListener('click', () => {
      $('input', optRetirada).checked = true;
      refresh();
    });
    optEntrega.addEventListener('click', () => {
      $('input', optEntrega).checked = true;
      refresh();
    });
  }

  function getFulfillment() {
    const checked = $('input[name="fulfillment"]:checked');
    return checked ? checked.value : '';
  }

  function validateDelivery() {
    let ok = true;
    const map = {
      nome: '#dfNome',
      endereco: '#dfEndereco',
      bairro: '#dfBairro',
      cidade: '#dfCidade',
    };
    Object.entries(map).forEach(([field, sel]) => {
      const input = $(sel);
      const wrap = input.closest('.field');
      if (!input.value.trim()) {
        wrap.classList.add('invalid');
        ok = false;
      } else {
        wrap.classList.remove('invalid');
      }
    });
    return ok;
  }

  function buildWhatsappMessage() {
    const { items, totalItems, totalValue } = cartTotals();
    const fulfillment = getFulfillment();

    const lines = [];
    lines.push('🛒 *NOVO PEDIDO — WKB HEADSHOP*');
    // Tipo do pedido em destaque, logo no topo, para facilitar
    const tipo = fulfillment === 'entrega' ? '🏍️ ENTREGA (UBERMOTO)' : '🏬 RETIRADA NO LOCAL';
    lines.push('📌 *TIPO: ' + tipo + '*');
    lines.push('');

    const nome =
      fulfillment === 'entrega'
        ? $('#dfNome').value.trim()
        : $('#dfNomeRetirada').value.trim();
    if (nome) lines.push('👤 *Cliente:* ' + nome);

    lines.push('');
    lines.push('*Itens do pedido:*');
    items.forEach((p) => {
      const code = p.code ? `[${p.code}] ` : '';
      const out = p.status === 'esgotado' ? ' ⚠️(ESGOTADO - sob encomenda)' : '';
      lines.push(
        `• ${code}${p.qty}x ${p.name} — ${WKBStore.formatPrice(p.price)} = ${WKBStore.formatPrice(
          p.lineTotal
        )}${out}`
      );
    });
    lines.push('');
    lines.push(`📦 *Quantidade total de itens:* ${totalItems}`);
    lines.push(`💰 *Valor total:* ${WKBStore.formatPrice(totalValue)}`);
    lines.push('');

    if (fulfillment === 'entrega') {
      lines.push('🏍️ *Forma:* Entrega por UberMoto (o cliente solicita a corrida)');
      lines.push('Retirar em (origem): ' + WKB_CONFIG.storeAddress);
      lines.push('');
      lines.push('*Dados de entrega:*');
      lines.push('Nome: ' + $('#dfNome').value.trim());
      lines.push('Endereço: ' + $('#dfEndereco').value.trim());
      lines.push('Bairro: ' + $('#dfBairro').value.trim());
      lines.push('Cidade: ' + $('#dfCidade').value.trim());
      const obs = $('#dfObs').value.trim();
      if (obs) lines.push('Observação: ' + obs);
    } else {
      lines.push('🏬 *Forma:* Retirada no local');
      lines.push('Endereço: ' + WKB_CONFIG.storeAddress);
    }

    // Pagamento PIX
    lines.push('');
    lines.push('💠 *Pagamento:* PIX');
    lines.push('Chave (' + WKB_CONFIG.pixKeyType + '): ' + WKB_CONFIG.pixKey);
    lines.push('Titular: ' + WKB_CONFIG.pixName);

    // Termo de entrega
    lines.push('');
    lines.push('✅ Cliente leu e aceitou o *termo de entrega*.');

    return lines.join('\n');
  }

  function checkout() {
    const { items } = cartTotals();
    if (items.length === 0) {
      toast('Seu carrinho está vazio.');
      return;
    }
    const fulfillment = getFulfillment();
    if (!fulfillment) {
      toast('Escolha retirada ou entrega.');
      $('.deliv-options').scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    if (fulfillment === 'entrega' && !validateDelivery()) {
      toast('Preencha os dados de entrega.');
      return;
    }
    // Termo de entrega obrigatório
    const termsBox = $('.terms-box');
    if (!$('#acceptTerms').checked) {
      termsBox.classList.add('invalid');
      termsBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
      toast('Aceite o termo de entrega para continuar.');
      return;
    }
    termsBox.classList.remove('invalid');

    const message = buildWhatsappMessage();
    const url = 'https://wa.me/' + WKB_CONFIG.whatsapp + '?text=' + encodeURIComponent(message);
    window.open(url, '_blank');
    toast('Abrindo o WhatsApp com seu pedido... 📲');
  }

  /* =====================================================================
     PIX e TERMO DE ENTREGA (preenchimento a partir de WKB_CONFIG)
     ===================================================================== */
  function setText(sel, text) {
    const el = $(sel);
    if (el) el.textContent = text;
  }

  function setupPixAndTerms() {
    const typeLabel = 'Chave (' + WKB_CONFIG.pixKeyType + ')';
    // Carrinho
    setText('#pixTypeLabel', typeLabel);
    setText('#pixKey', WKB_CONFIG.pixKey);
    setText('#pixName', WKB_CONFIG.pixName);
    const nameEl = $('#pixName');
    if (nameEl) nameEl.innerHTML = 'Titular: <strong>' + escapeHtml(WKB_CONFIG.pixName) + '</strong>';
    // Como comprar
    setText('#pixTypeLabel2', typeLabel);
    setText('#pixKey2', WKB_CONFIG.pixKey);
    const nameEl2 = $('#pixName2');
    if (nameEl2) nameEl2.innerHTML = 'Titular: <strong>' + escapeHtml(WKB_CONFIG.pixName) + '</strong>';
    // Contato
    setText('#pixNameContato', WKB_CONFIG.pixName);
    setText('#pixKeyContato', WKB_CONFIG.pixKey);

    // Endereço da loja (retirada / origem UberMoto)
    setText('#storeAddrPickup', WKB_CONFIG.storeAddress);
    setText('#storeAddrDelivery', WKB_CONFIG.storeAddress);
    setText('#storeAddrContato', WKB_CONFIG.storeAddress);

    // Termo de entrega (listas)
    const terms = WKB_CONFIG.deliveryTerms || [];
    const html = terms.map((t) => `<li>${escapeHtml(t)}</li>`).join('');
    ['#termsList', '#termsListInfo'].forEach((sel) => {
      const el = $(sel);
      if (el) el.innerHTML = html;
    });

    // Tira o estado de erro assim que o cliente marca o termo
    const accept = $('#acceptTerms');
    if (accept) {
      accept.addEventListener('change', () => {
        if (accept.checked) $('.terms-box').classList.remove('invalid');
      });
    }

    // Botões de copiar PIX
    ['#copyPixBtn', '#copyPixBtn2'].forEach((sel) => {
      const btn = $(sel);
      if (!btn) return;
      btn.addEventListener('click', () => copyPix(btn));
    });
  }

  function copyPix(btn) {
    const key = WKB_CONFIG.pixKey;
    const done = () => {
      const original = btn.textContent;
      btn.textContent = 'Copiado ✓';
      toast('Chave PIX copiada ✓');
      setTimeout(() => (btn.textContent = original), 1800);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(key).then(done).catch(() => fallbackCopy(key, done));
    } else {
      fallbackCopy(key, done);
    }
  }

  function fallbackCopy(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      done();
    } catch (e) {
      toast('Copie a chave: ' + text);
    }
    ta.remove();
  }

  /* =====================================================================
     INICIALIZAÇÃO
     ===================================================================== */
  function init() {
    $('#year').textContent = new Date().getFullYear();

    // Navegação por data-route (garante roteamento mesmo com âncoras)
    $$('[data-route]').forEach((el) => {
      el.addEventListener('click', (e) => {
        // deixa o hash cuidar; só fecha o menu
        $('#navLinks').classList.remove('open');
      });
    });

    // Menu mobile
    $('#navToggle').addEventListener('click', () => {
      $('#navLinks').classList.toggle('open');
    });

    setupFulfillment();
    setupPixAndTerms();
    $('#checkoutBtn').addEventListener('click', checkout);

    updateCartCount();
    router();
  }

  document.addEventListener('DOMContentLoaded', init);
})();
