/* =====================================================================
   WKB HEADSHOP — Painel administrativo (admin.js)
   Gerencia produtos e categorias. Tudo é salvo no localStorage e
   aparece automaticamente na loja (index.html).
   ===================================================================== */

(function () {
  'use strict';

  WKBStore.init();

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  let editingId = null;

  function toast(msg) {
    const wrap = $('#toastWrap');
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 2600);
  }

  function escapeHtml(str) {
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function escapeAttr(str) {
    return escapeHtml(str).replace(/"/g, '&quot;');
  }

  function thumb(product, index = 0) {
    if (product.image) {
      return `<img src="${escapeAttr(product.image)}" alt="" onerror="this.style.display='none'" />`;
    }
    return wkbIconFor(product, index);
  }

  /* ---------- Categorias no <select> e na lista ---------- */
  function fillCategorySelect() {
    const cats = WKBStore.getCategories();
    const sel = $('#pCategory');
    const current = sel.value;
    sel.innerHTML = cats
      .map((c) => `<option value="${escapeAttr(c.id)}">${escapeHtml(c.name)}</option>`)
      .join('');
    if (current) sel.value = current;
  }

  function renderCategories() {
    const cats = WKBStore.getCategories();
    const products = WKBStore.getProducts();
    const wrap = $('#catManage');
    wrap.innerHTML = cats
      .map((c) => {
        const count = products.filter((p) => p.category === c.id).length;
        return `<span class="cat-tag">
            ${escapeHtml(c.name)} <span class="footer-note">(${count})</span>
            <button data-del-cat="${escapeAttr(c.id)}" title="Excluir categoria">×</button>
          </span>`;
      })
      .join('');

    $$('[data-del-cat]', wrap).forEach((btn) => {
      btn.addEventListener('click', () => deleteCategory(btn.getAttribute('data-del-cat')));
    });
  }

  function deleteCategory(id) {
    const products = WKBStore.getProducts();
    const inUse = products.filter((p) => p.category === id).length;
    const cat = WKBStore.getCategory(id);
    if (!cat) return;
    let msg = 'Excluir a categoria "' + cat.name + '"?';
    if (inUse > 0) {
      msg += '\n\nHá ' + inUse + ' produto(s) nela. Eles ficarão sem categoria.';
    }
    if (!confirm(msg)) return;
    WKBStore.deleteCategory(id);
    renderAll();
    toast('Categoria excluída.');
  }

  /* ---------- Lista de produtos ---------- */
  function renderProducts() {
    const products = WKBStore.getProducts();
    const tbody = $('#adminProductRows');
    const empty = $('#adminEmpty');

    $('#productCount').textContent =
      products.length + (products.length === 1 ? ' produto' : ' produtos');

    if (products.length === 0) {
      tbody.innerHTML = '';
      empty.style.display = 'block';
      return;
    }
    empty.style.display = 'none';

    tbody.innerHTML = products
      .map(
        (p, i) => `<tr>
          <td><div class="admin-thumb" style="color:${WKB_NEON_COLORS[i % WKB_NEON_COLORS.length]}">${thumb(
          p,
          i
        )}</div></td>
          <td>
            <strong>${escapeHtml(p.name)}</strong>
            <div class="footer-note">${escapeHtml((p.description || '').slice(0, 48))}${
          (p.description || '').length > 48 ? '…' : ''
        }</div>
          </td>
          <td>${escapeHtml(WKBStore.categoryName(p.category))}</td>
          <td><strong>${WKBStore.formatPrice(p.price)}</strong></td>
          <td><span class="pill ${p.status}">${p.status === 'esgotado' ? 'Esgotado' : 'Disponível'}</span></td>
          <td>
            <div class="row-actions">
              <button class="icon-btn" data-edit="${escapeAttr(p.id)}">✏️ Editar</button>
              <button class="icon-btn" data-toggle="${escapeAttr(p.id)}">${
          p.status === 'esgotado' ? '✅ Disponível' : '⛔ Esgotar'
        }</button>
              <button class="icon-btn danger" data-del="${escapeAttr(p.id)}">🗑️</button>
            </div>
          </td>
        </tr>`
      )
      .join('');

    $$('[data-edit]', tbody).forEach((b) =>
      b.addEventListener('click', () => startEdit(b.getAttribute('data-edit')))
    );
    $$('[data-toggle]', tbody).forEach((b) =>
      b.addEventListener('click', () => toggleStatus(b.getAttribute('data-toggle')))
    );
    $$('[data-del]', tbody).forEach((b) =>
      b.addEventListener('click', () => deleteProduct(b.getAttribute('data-del')))
    );
  }

  function toggleStatus(id) {
    const p = WKBStore.getProduct(id);
    if (!p) return;
    WKBStore.updateProduct(id, {
      status: p.status === 'esgotado' ? 'disponivel' : 'esgotado',
    });
    renderProducts();
    toast('Status atualizado.');
  }

  function deleteProduct(id) {
    const p = WKBStore.getProduct(id);
    if (!p) return;
    if (!confirm('Excluir o produto "' + p.name + '"?')) return;
    WKBStore.deleteProduct(id);
    if (editingId === id) resetForm();
    renderProducts();
    toast('Produto excluído.');
  }

  /* ---------- Formulário: adicionar/editar ---------- */
  function startEdit(id) {
    const p = WKBStore.getProduct(id);
    if (!p) return;
    editingId = id;
    $('#pId').value = p.id;
    $('#pName').value = p.name;
    $('#pPrice').value = p.price;
    fillCategorySelect();
    $('#pCategory').value = p.category;
    $('#pDesc').value = p.description || '';
    $('#pImage').value = p.image || '';
    $('#pStatus').value = p.status;

    $('#formTitle').textContent = '✏️ Editar produto';
    $('#saveBtn').textContent = 'Salvar alterações';
    $('#cancelEditBtn').style.display = 'inline-flex';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function resetForm() {
    editingId = null;
    $('#productForm').reset();
    $('#pId').value = '';
    $('#formTitle').textContent = '➕ Adicionar produto';
    $('#saveBtn').textContent = 'Salvar produto';
    $('#cancelEditBtn').style.display = 'none';
  }

  function submitForm(e) {
    e.preventDefault();
    const name = $('#pName').value.trim();
    const price = parseFloat($('#pPrice').value);
    const category = $('#pCategory').value;
    if (!name || isNaN(price) || !category) {
      toast('Preencha nome, preço e categoria.');
      return;
    }
    const cat = WKBStore.getCategory(category);
    const data = {
      name,
      price,
      category,
      description: $('#pDesc').value.trim(),
      image: $('#pImage').value.trim(),
      status: $('#pStatus').value,
      icon: cat ? cat.icon : 'tray',
    };

    if (editingId) {
      WKBStore.updateProduct(editingId, data);
      toast('Produto atualizado ✓');
    } else {
      WKBStore.addProduct(data);
      toast('Produto adicionado ✓');
    }
    resetForm();
    renderProducts();
  }

  /* ---------- Nova categoria ---------- */
  function submitCategory(e) {
    e.preventDefault();
    const name = $('#catName').value.trim();
    if (!name) return;
    // Ícone padrão rotativo entre os disponíveis
    const icons = ['seda', 'bong', 'grinder', 'lighter', 'bowl', 'tray'];
    const count = WKBStore.getCategories().length;
    WKBStore.addCategory({ name, icon: icons[count % icons.length] });
    $('#catName').value = '';
    renderAll();
    toast('Categoria criada ✓');
  }

  /* ---------- Reset ---------- */
  function resetAll() {
    if (!confirm('Restaurar os produtos e categorias padrão? Isso apaga suas alterações.')) return;
    WKBStore.resetToDefaults();
    resetForm();
    renderAll();
    toast('Dados restaurados ao padrão.');
  }

  function renderAll() {
    fillCategorySelect();
    renderCategories();
    renderProducts();
  }

  /* ---------------------------------------------------------------------
     LOGIN — painel privado com senha (WKB_CONFIG.adminPassword)
     A sessão fica válida enquanto a aba estiver aberta (sessionStorage).
     Observação: por ser um site estático, esta é uma proteção simples do
     lado do cliente — mantém o painel fora do alcance casual dos visitantes.
     ------------------------------------------------------------------- */
  const AUTH_KEY = 'wkb_admin_auth';

  function isAuthenticated() {
    return sessionStorage.getItem(AUTH_KEY) === '1';
  }

  function showPanel() {
    $('#loginOverlay').style.display = 'none';
    $('#adminShell').style.display = 'block';
    renderAll();
  }

  function handleLogin(e) {
    e.preventDefault();
    const pass = $('#loginPass').value;
    if (pass === WKB_CONFIG.adminPassword) {
      sessionStorage.setItem(AUTH_KEY, '1');
      $('#loginError').closest('.field').classList.remove('invalid');
      showPanel();
    } else {
      $('#loginError').closest('.field').classList.add('invalid');
      $('#loginPass').value = '';
      $('#loginPass').focus();
    }
  }

  function logout() {
    sessionStorage.removeItem(AUTH_KEY);
    location.reload();
  }

  /* ---------- Init ---------- */
  function init() {
    // Login
    $('#loginForm').addEventListener('submit', handleLogin);
    $('#logoutBtn').addEventListener('click', logout);

    // Ações do painel
    $('#productForm').addEventListener('submit', submitForm);
    $('#categoryForm').addEventListener('submit', submitCategory);
    $('#cancelEditBtn').addEventListener('click', resetForm);
    $('#resetBtn').addEventListener('click', resetAll);

    if (isAuthenticated()) {
      showPanel();
    } else {
      $('#loginOverlay').style.display = 'flex';
      $('#loginPass').focus();
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
