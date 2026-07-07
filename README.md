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

  adminPassword: 'emi2026',            // senha do painel admin
  pixKey: '60161518000139',            // chave PIX (CNPJ)
  pixKeyType: 'CNPJ',
  pixName: 'Wendrio Kauan Botelho',    // titular do PIX

  deliveryTerms: [ /* itens do termo de entrega */ ],
};
```

- **WhatsApp**: formato internacional, só dígitos: `55` (Brasil) + DDD + número.
- **adminPassword**: senha para entrar no painel (`admin.html`).
- **pixKey / pixName**: aparecem no carrinho, na página "Como comprar", no contato
  e na mensagem enviada ao WhatsApp.
- **deliveryTerms**: itens do termo de entrega (uma frase por item). O cliente
  precisa marcar "Li e aceito o termo de entrega" para finalizar o pedido.

---

## 🛒 Como funciona o pedido

1. O cliente navega pelos **Produtos** e clica em **Adicionar ao carrinho**.
2. No **Carrinho**, ele ajusta as quantidades (o total é somado automaticamente).
3. Antes de enviar, escolhe **Retirada** ou **Entrega por UberMoto**.
   - Se escolher **Entrega (UberMoto)**, preenche nome, endereço, bairro, cidade e observação.
   - A taxa da corrida do UberMoto é combinada e informada pelo WhatsApp.
4. Ao clicar em **Enviar pedido pelo WhatsApp**, o site monta uma mensagem
   pronta (cliente, itens, quantidades, valor total, forma e dados de entrega)
   e abre o WhatsApp da loja.

> O WhatsApp **só aparece no final da compra** — nunca na home como bloco de contato.

Produtos marcados como **Esgotado** mostram um aviso e o botão
**“Solicitar mesmo assim”** — o cliente pode pedir e aguardar a reposição.
O item vai para o carrinho e para a mensagem do WhatsApp marcado como
*“ESGOTADO – sob encomenda”*. (Se o item esgotado estiver sem preço, aí sim
o botão fica desativado, indicando falar com a loja pelo WhatsApp.)

---

## 🔧 Painel administrativo (`admin.html`)

> 🔒 **Área privada.** O painel pede senha para entrar.
> **Senha padrão: `emi2026`** (troque em `js/data.js` → `WKB_CONFIG.adminPassword`).
> A sessão fica ativa enquanto a aba estiver aberta; use o botão **Sair** para bloquear.
>
> Por ser um site estático, essa é uma proteção do lado do cliente — mantém o painel
> fora do alcance casual dos visitantes. Para segurança de verdade, hospede o
> `admin.html` num local restrito ou atrás de um login de servidor.

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

As fotos reais dos produtos ficam na pasta **`assets/products/`**. Cada produto
aponta para a sua foto pelo campo "URL da imagem" (ex.: `assets/products/kit-barbie.jpg`).

- Para **trocar a foto** de um kit, substitua o arquivo em `assets/products/`
  mantendo o mesmo nome, ou cole uma nova URL/caminho no campo do painel.
- Se o campo ficar vazio, o site mostra uma **ilustração neon** da categoria —
  nada de fotos falsas.

O catálogo já vem com os **6 kits reais da loja** (estojos e bandejas), com preço
no valor de cada um (R$ 105 a R$ 180).

> Sempre que você editar o catálogo padrão em `js/data.js`, aumente o número
> `DATA_VERSION` para que a loja recarregue as novidades para quem já visitou.

> ⚠️ **Importante:** por usar `localStorage`, os dados ficam salvos **no navegador
> em que foram editados**. Para uma loja com estoque compartilhado entre vários
> dispositivos, o próximo passo natural é conectar um backend/banco de dados.
> A camada de dados em `js/data.js` foi feita para facilitar essa evolução.

---

## 🎨 Design

- Fundo grafite/preto com brilhos neon (verde, roxo, azul, amarelo, laranja)
- Logo **WKB** (emblema em `assets/logo.svg`) no menu, no rodapé, no painel e
  em destaque grande na home
- Cards modernos, botões chamativos e layout **100% responsivo** (celular incluso)

Para trocar o logo, substitua **`assets/logo.svg`** (ou aponte as tags `<img>`
para um `.png`/`.jpg` seu).

O **fundo do site** fica em **`assets/wkb-fundo.jpg`** (aplicado com uma camada
escura por cima para o conteúdo continuar legível). Para trocar, substitua esse
arquivo mantendo o nome.

## 🔢 Código dos produtos

Cada produto tem um **código** (ex.: `WKB-001`) que aparece:
- no card do produto (etiqueta azul),
- no carrinho,
- na tabela do painel admin,
- e na mensagem do WhatsApp (`[WKB-001] 1x Kit ...`).

Assim fica fácil você e o cliente falarem do mesmo item. O painel **sugere o
próximo código automaticamente** ao cadastrar um produto novo (você pode editar).

> Produtos com **preço 0** aparecem como **“A combinar”** e ficam sem o botão de
> compra até você definir o valor no painel — útil para itens que ainda não têm preço.

## 💳 Pagamento (PIX) e Termo de entrega

- O **PIX** aparece no carrinho (com botão **Copiar**), na página "Como comprar",
  no contato e vai junto na mensagem do WhatsApp.
- O **termo de entrega** é mostrado no carrinho; o cliente precisa **aceitar**
  (checkbox) antes de enviar o pedido, e o aceite fica registrado na mensagem.
- Edite os dois em `js/data.js` (`pixKey`, `pixName`, `deliveryTerms`).

---

## 🔞 Aviso legal

Venda proibida para menores de 18 anos. Os produtos são acessórios para uso
adulto e destinados apenas a fins legais, conforme a legislação vigente.
Ajuste os textos conforme as regras da sua região.
