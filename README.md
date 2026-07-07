# 💨 WKB Headshop — Mini site

Site profissional para a **WKB Headshop**, com visual neon urbano, catálogo de
produtos, carrinho com fechamento de pedido pelo **WhatsApp** e um **painel
administrativo** para o dono da loja gerenciar tudo.

> **Estilo para sua brisa** ✨

---

## 🚀 Como usar

Não precisa instalar nada nem compilar. É HTML, CSS e JavaScript puro.

1. Abra o arquivo **`index.html`** no navegador (loja).
2. Abra **`admin.html`** para o painel administrativo.

Para publicar online, é só subir a pasta em qualquer hospedagem estática
(GitHub Pages, Netlify, Vercel, etc.).

> Dica: para testar localmente com todos os recursos, rode um servidor simples:
> ```bash
> python3 -m http.server 8000
> ```
> e acesse `http://localhost:8000`.

---

## 📂 Estrutura dos arquivos

```
wkb/
├── index.html        # Loja (Home, Produtos, Sobre, Como comprar, Carrinho, Contato)
├── admin.html        # Painel administrativo
├── css/
│   └── styles.css    # Todo o visual neon
└── js/
    ├── data.js       # Configurações, produtos padrão e persistência (localStorage)
    ├── store.js      # Lógica da loja (carrinho, roteamento, WhatsApp)
    └── admin.js      # Lógica do painel administrativo
```

---

## ⚙️ Configuração rápida

Abra **`js/data.js`** e edite o topo do arquivo:

```js
const WKB_CONFIG = {
  storeName: 'WKB Headshop',
  slogan: 'Estilo para sua brisa',
  whatsapp: '5511999999999', // 👈 TROQUE pelo número que recebe os pedidos
  currency: 'R$',
};
```

O número do WhatsApp deve estar no formato internacional, só com dígitos:
`55` (Brasil) + DDD + número. Exemplo: `5511999999999`.

---

## 🛒 Como funciona o pedido

1. O cliente navega pelos **Produtos** e clica em **Adicionar ao carrinho**.
2. No **Carrinho**, ele ajusta as quantidades (o total é somado automaticamente).
3. Antes de enviar, escolhe **Retirada** ou **Entrega**.
   - Se escolher **Entrega**, preenche nome, endereço, bairro, cidade e observação.
4. Ao clicar em **Enviar pedido pelo WhatsApp**, o site monta uma mensagem
   pronta (cliente, itens, quantidades, valor total, forma e dados de entrega)
   e abre o WhatsApp da loja.

> O WhatsApp **só aparece no final da compra** — nunca na home como bloco de contato.

Produtos marcados como **Esgotado** aparecem com o botão desativado.

---

## 🔧 Painel administrativo (`admin.html`)

O dono da loja pode, sem mexer no código:

- ➕ **Adicionar** novo produto
- ✏️ **Editar** produto (nome, preço, descrição, imagem, categoria, status)
- 🗑️ **Excluir** produto
- ✅/⛔ Marcar como **Disponível** ou **Esgotado** (um clique)
- 🏷️ **Criar** e excluir **categorias**
- 📦 **Ver a lista** de todos os produtos cadastrados
- ↺ **Restaurar** o catálogo padrão

Todas as alterações são salvas no navegador (**localStorage**) e aparecem
**automaticamente** na loja.

### Sobre as imagens

Cada produto pode ter uma **foto real** (cole a URL da imagem no campo
"URL da imagem"). Se o campo ficar vazio, o site mostra uma **ilustração neon**
da categoria — nada de fotos falsas.

> ⚠️ **Importante:** por usar `localStorage`, os dados ficam salvos **no navegador
> em que foram editados**. Para uma loja com estoque compartilhado entre vários
> dispositivos, o próximo passo natural é conectar um backend/banco de dados.
> A camada de dados em `js/data.js` foi feita para facilitar essa evolução.

---

## 🎨 Design

- Fundo grafite/preto com brilhos neon (verde, roxo, azul, amarelo, laranja)
- Logo **WKB** em destaque grande na home
- Cards modernos, botões chamativos e layout **100% responsivo** (celular incluso)

---

## 🔞 Aviso legal

Venda proibida para menores de 18 anos. Os produtos são acessórios para uso
adulto e destinados apenas a fins legais, conforme a legislação vigente.
Ajuste os textos conforme as regras da sua região.
