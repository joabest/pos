import React, { useMemo, useState } from 'react';
import './styles.css';

const brl = (v) => Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const statusByQty = (qtd) => qtd <= 0 ? 'Fora de Estoque' : qtd <= 20 ? 'Estoque Baixo' : 'Em Estoque';

const initialProducts = [
  { id: 1, codigo: '7891001', nome: 'Arroz Branco 5kg', marca: 'Tio João', categoria: 'Grãos', qtd: 120, custo: 18.9, preco: 26.9, icon: '🍚' },
  { id: 2, codigo: '7891002', nome: 'Óleo de Soja 900ml', marca: 'Liza', categoria: 'Óleos', qtd: 88, custo: 6.2, preco: 8.49, icon: '🛢️' },
  { id: 3, codigo: '7891003', nome: 'Leite Integral 1L', marca: 'Piracanjuba', categoria: 'Laticínios', qtd: 0, custo: 4.1, preco: 5.79, icon: '🥛' },
  { id: 4, codigo: '7891004', nome: 'Feijão Preto 1kg', marca: 'Camil', categoria: 'Grãos', qtd: 18, custo: 7.5, preco: 9.99, icon: '🫘' },
  { id: 5, codigo: '7891005', nome: 'Açúcar Cristal 1kg', marca: 'União', categoria: 'Mercearia', qtd: 14, custo: 4.3, preco: 6.29, icon: '🍬' },
  { id: 6, codigo: '7891006', nome: 'Café Torrado 500g', marca: 'Pilão', categoria: 'Bebidas', qtd: 56, custo: 12.6, preco: 17.99, icon: '☕' },
  { id: 7, codigo: '7891007', nome: 'Macarrão 500g', marca: 'Adria', categoria: 'Massas', qtd: 32, custo: 2.4, preco: 3.49, icon: '🍝' },
  { id: 8, codigo: '7891008', nome: 'Detergente 500ml', marca: 'Ypê', categoria: 'Limpeza', qtd: 6, custo: 1.95, preco: 2.79, icon: '🧴' },
  { id: 9, codigo: '7891009', nome: 'Sabão em Pó 1kg', marca: 'Omo', categoria: 'Limpeza', qtd: 0, custo: 10.9, preco: 14.9, icon: '🧼' },
  { id: 10, codigo: '7891010', nome: 'Papel Higiênico 12x30m', marca: 'Neve', categoria: 'Higiene', qtd: 21, custo: 14.5, preco: 19.9, icon: '🧻' }
].map((p) => ({ ...p, status: statusByQty(p.qtd) }));

const initialSuppliers = [
  { id: 1, nome: 'Distribuidora São Paulo', contato: '(11) 4002-1000', categoria: 'Mercearia', status: 'Ativo' },
  { id: 2, nome: 'Atacado Penha', contato: '(11) 98888-1111', categoria: 'Bebidas', status: 'Ativo' },
  { id: 3, nome: 'Limpeza Total', contato: '(11) 97777-2222', categoria: 'Limpeza', status: 'Pendente' }
];

function App() {
  const [page, setPage] = useState('Dashboard');
  const [dark, setDark] = useState(false);
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState(initialProducts);
  const [cart, setCart] = useState([]);
  const [sales, setSales] = useState([]);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [payMethod, setPayMethod] = useState('Dinheiro');
  const [notice, setNotice] = useState('Sistema pronto.');
  const [settings, setSettings] = useState({ estoque: true, recibo: true, imposto: true });

  const menu = ['Dashboard', 'Itens', 'PDV', 'Relatório de Vendas', 'Fornecedores', 'Configurações'];

  const addToCart = (product) => {
    if (product.qtd <= 0) return setNotice('Produto fora de estoque.');
    setCart((items) => {
      const found = items.find((i) => i.id === product.id);
      if (found && found.qtdCarrinho >= product.qtd) {
        setNotice('Quantidade máxima disponível já está no carrinho.');
        return items;
      }
      if (found) return items.map((i) => i.id === product.id ? { ...i, qtdCarrinho: i.qtdCarrinho + 1 } : i);
      return [...items, { ...product, qtdCarrinho: 1 }];
    });
    setNotice(`${product.nome} adicionado ao carrinho.`);
  };

  const changeCartQty = (id, amount) => {
    setCart((items) => items.map((i) => {
      if (i.id !== id) return i;
      const next = Math.max(1, Math.min(i.qtd, i.qtdCarrinho + amount));
      return { ...i, qtdCarrinho: next };
    }));
  };

  const finishSale = () => {
    if (!cart.length) return setNotice('Adicione produtos antes de finalizar.');
    const subtotal = cart.reduce((s, p) => s + p.preco * p.qtdCarrinho, 0);
    const imposto = settings.imposto ? subtotal * 0.1 : 0;
    const desconto = subtotal > 50 ? 5 : 0;
    const total = subtotal + imposto - desconto;
    const sale = { id: Date.now(), data: new Date().toLocaleString('pt-BR'), itens: cart.length, metodo: payMethod, total };
    setSales((list) => [sale, ...list]);
    setProducts((list) => list.map((p) => {
      const sold = cart.find((i) => i.id === p.id);
      if (!sold) return p;
      const qtd = Math.max(0, p.qtd - sold.qtdCarrinho);
      return { ...p, qtd, status: statusByQty(qtd) };
    }));
    setCart([]);
    setNotice(`Venda finalizada em ${payMethod}: ${brl(total)}.`);
  };

  return (
    <main className={dark ? 'app dark' : 'app'}>
      <aside className="side">
        <b className="logo">LOGO</b>
        {menu.map((item) => <button key={item} className={page === item ? 'on' : ''} onClick={() => setPage(item)}>{item}</button>)}
        <small>Sistema de PDV e Gestão</small>
      </aside>
      <section className="content">
        <header className="topbar">
          <div><span>POS</span><h1>{page}</h1></div>
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Pesquisar..." />
          <button onClick={() => setDark(!dark)}>{dark ? '☀️' : '🌙'}</button>
        </header>
        <div className="notice">{notice}</div>
        {page === 'Dashboard' && <Dashboard products={products} sales={sales} setPage={setPage} />}
        {page === 'Itens' && <Itens products={products} setProducts={setProducts} search={search} setNotice={setNotice} />}
        {page === 'PDV' && <PDV products={products} search={search} cart={cart} addToCart={addToCart} changeCartQty={changeCartQty} removeItem={(id) => setCart(cart.filter((i) => i.id !== id))} payMethod={payMethod} setPayMethod={setPayMethod} finishSale={finishSale} settings={settings} />}
        {page === 'Relatório de Vendas' && <Relatorios sales={sales} />}
        {page === 'Fornecedores' && <Fornecedores suppliers={suppliers} setSuppliers={setSuppliers} setNotice={setNotice} />}
        {page === 'Configurações' && <Configuracoes settings={settings} setSettings={setSettings} />}
      </section>
    </main>
  );
}

function Card({ t, v, s, onClick }) { return <button className="card" onClick={onClick}><p>{t}</p><h2>{v}</h2><small>{s}</small></button>; }
function Tag({ s }) { return <span className={'tag ' + s.toLowerCase().replaceAll(' ', '-')}>{s}</span>; }

function Dashboard({ products, sales, setPage }) {
  const receita = sales.reduce((s, v) => s + v.total, 0);
  const baixos = products.filter((p) => p.status === 'Estoque Baixo').length;
  const falta = products.filter((p) => p.status === 'Fora de Estoque').length;
  return <div className="page"><div className="cards"><Card t="Vendas Totais" v={sales.length} s="clique para ver relatório" onClick={() => setPage('Relatório de Vendas')} /><Card t="Receita Total" v={brl(receita)} s="somatório das vendas" onClick={() => setPage('Relatório de Vendas')} /><Card t="Estoque Baixo" v={baixos} s="clique para ver itens" onClick={() => setPage('Itens')} /><Card t="Itens em Falta" v={falta} s="clique para ver itens" onClick={() => setPage('Itens')} /></div><div className="two"><section className="panel"><h3>Vendas da Semana</h3><div className="bars">{[35, 70, 48, 88, 62, 76, 44].map((h, i) => <i style={{ height: h + '%' }} key={i} />)}</div><div className="days"><span>Dom</span><span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span></div></section><section className="panel"><h3>Resumo de Estoque</h3><div className="donut"><b>{products.length}</b><span>Itens</span></div><p>🟢 Em Estoque {products.filter((p) => p.status === 'Em Estoque').length}</p><p>🟡 Estoque Baixo {baixos}</p><p>🔴 Fora de Estoque {falta}</p></section></div><Tabela titulo="Itens de Atenção" lista={products.filter((p) => p.status !== 'Em Estoque')} /></div>;
}

function Itens({ products, setProducts, search, setNotice }) {
  const [cat, setCat] = useState('Todos');
  const [status, setStatus] = useState('Todos');
  const [editing, setEditing] = useState(null);
  const cats = ['Todos', ...new Set(products.map((p) => p.categoria))];
  const filtered = products.filter((p) => (cat === 'Todos' || p.categoria === cat) && (status === 'Todos' || p.status === status) && p.nome.toLowerCase().includes(search.toLowerCase()));
  const save = (item) => {
    const qtd = Number(item.qtd || 0);
    const data = { ...item, qtd, custo: Number(item.custo || 0), preco: Number(item.preco || 0), status: statusByQty(qtd) };
    setProducts((list) => data.id ? list.map((p) => p.id === data.id ? data : p) : [{ ...data, id: Date.now(), codigo: String(Date.now()).slice(-7), icon: data.icon || '📦' }, ...list]);
    setEditing(null); setNotice('Item salvo com sucesso.');
  };
  const del = (id) => { if (confirm('Excluir este item?')) { setProducts((list) => list.filter((p) => p.id !== id)); setNotice('Item excluído.'); } };
  return <div className="page"><div className="actions"><select value={cat} onChange={(e) => setCat(e.target.value)}>{cats.map((c) => <option key={c}>{c}</option>)}</select><select value={status} onChange={(e) => setStatus(e.target.value)}>{['Todos', 'Em Estoque', 'Estoque Baixo', 'Fora de Estoque'].map((s) => <option key={s}>{s}</option>)}</select><button className="primary" onClick={() => setEditing({ nome: '', marca: '', categoria: '', qtd: 0, custo: 0, preco: 0, icon: '📦' })}>Adicionar Item</button></div><Tabela titulo="Itens" lista={filtered} onEdit={setEditing} onDelete={del} />{editing && <ItemModal item={editing} onClose={() => setEditing(null)} onSave={save} />}</div>;
}

function ItemModal({ item, onClose, onSave }) {
  const [form, setForm] = useState(item);
  const change = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  return <div className="modal"><div className="modalBox"><h2>{form.id ? 'Atualizar Item' : 'Adicionar Item'}</h2><div className="form"><input value={form.nome} onChange={(e) => change('nome', e.target.value)} placeholder="Nome do item" /><input value={form.marca} onChange={(e) => change('marca', e.target.value)} placeholder="Marca" /><input value={form.categoria} onChange={(e) => change('categoria', e.target.value)} placeholder="Categoria" /><input value={form.icon} onChange={(e) => change('icon', e.target.value)} placeholder="Ícone" /><input type="number" value={form.qtd} onChange={(e) => change('qtd', e.target.value)} placeholder="Quantidade" /><input type="number" value={form.custo} onChange={(e) => change('custo', e.target.value)} placeholder="Preço de compra" /><input type="number" value={form.preco} onChange={(e) => change('preco', e.target.value)} placeholder="Preço de venda" /></div><div className="actions right"><button onClick={onClose}>Cancelar</button><button className="primary" onClick={() => onSave(form)}>Salvar</button></div></div></div>;
}

function Tabela({ titulo, lista, onEdit, onDelete }) {
  return <section className="panel"><h3>{titulo}</h3><div className="table"><div className="thead"><b>Nome do Item</b><b>Marca</b><b>Categoria</b><b>Qtd.</b><b>Compra</b><b>Venda</b><b>Status</b><b>Ação</b></div>{lista.map((p) => <div className="tr" key={p.id}><span>{p.icon} {p.nome}</span><span>{p.marca}</span><span>{p.categoria}</span><span>{p.qtd} un.</span><span>{brl(p.custo)}</span><span>{brl(p.preco)}</span><span><Tag s={p.status} /></span><span className="rowBtns">{onEdit && <button onClick={() => onEdit(p)}>Editar</button>}{onDelete && <button onClick={() => onDelete(p.id)}>Excluir</button>}</span></div>)}</div></section>;
}

function PDV({ products, search, cart, addToCart, changeCartQty, removeItem, payMethod, setPayMethod, finishSale, settings }) {
  const [cat, setCat] = useState('Todos');
  const cats = ['Todos', ...new Set(products.map((p) => p.categoria))];
  const visible = products.filter((p) => (cat === 'Todos' || p.categoria === cat) && (p.nome.toLowerCase().includes(search.toLowerCase()) || p.codigo.includes(search)));
  const subtotal = cart.reduce((s, p) => s + p.preco * p.qtdCarrinho, 0);
  const imposto = settings.imposto ? subtotal * 0.1 : 0;
  const desconto = subtotal > 50 ? 5 : 0;
  const total = subtotal + imposto - desconto;
  const barcode = () => { const code = prompt('Digite ou leia o código de barras:'); const item = products.find((p) => p.codigo === code); item ? addToCart(item) : alert('Produto não encontrado.'); };
  return <div className="page pdv"><section><div className="actions"><button className="primary" onClick={barcode}>Ler Código de Barras</button><button onClick={() => setCat('Todos')}>Limpar Filtros</button></div><div className="tabs">{cats.map((c) => <button key={c} className={cat === c ? 'on' : ''} onClick={() => setCat(c)}>{c}</button>)}</div><div className="products">{visible.map((p) => <article key={p.id}><div>{p.icon}</div><h3>{p.nome}</h3><p>{p.qtd} un. em estoque</p><strong>{brl(p.preco)}</strong><button disabled={!p.qtd} onClick={() => addToCart(p)}>{p.qtd ? 'Adicionar' : 'Sem estoque'}</button></article>)}</div></section><aside className="cart"><h2>Detalhes do Carrinho</h2><small>#PDV-000125</small>{cart.length === 0 && <p className="empty">Carrinho vazio.</p>}{cart.map((p) => <div className="cartitem" key={p.id}><span>{p.icon}</span><b>{p.nome}</b><button onClick={() => changeCartQty(p.id, -1)}>-</button><em>{p.qtdCarrinho}</em><button onClick={() => changeCartQty(p.id, 1)}>+</button><button onClick={() => removeItem(p.id)}>×</button></div>)}<div className="totais"><p><span>Subtotal</span><b>{brl(subtotal)}</b></p><p><span>Imposto (10%)</span><b>{brl(imposto)}</b></p><p><span>Desconto</span><b>- {brl(desconto)}</b></p><h3><span>Total a Pagar</span><b>{brl(total)}</b></h3></div><div className="pay">{['Dinheiro', 'Cartão', 'Pix'].map((m) => <button key={m} className={payMethod === m ? 'on' : ''} onClick={() => setPayMethod(m)}>{m}</button>)}</div><button className="continuar" onClick={finishSale}>Finalizar Venda</button></aside></div>;
}

function Relatorios({ sales }) {
  const total = sales.reduce((s, v) => s + v.total, 0);
  return <div className="page"><div className="cards"><Card t="Vendas" v={sales.length} s="finalizadas" /><Card t="Faturamento" v={brl(total)} s="período atual" /><Card t="Ticket Médio" v={brl(sales.length ? total / sales.length : 0)} s="média" /></div><section className="panel"><h3>Histórico de Vendas</h3><div className="salesList">{sales.length === 0 ? <p>Nenhuma venda finalizada ainda.</p> : sales.map((s) => <div key={s.id}><b>{s.data}</b><span>{s.itens} itens</span><span>{s.metodo}</span><strong>{brl(s.total)}</strong></div>)}</div></section></div>;
}

function Fornecedores({ suppliers, setSuppliers, setNotice }) {
  const add = () => { const nome = prompt('Nome do fornecedor:'); if (!nome) return; setSuppliers((list) => [{ id: Date.now(), nome, contato: '(11) 00000-0000', categoria: 'Geral', status: 'Ativo' }, ...list]); setNotice('Fornecedor adicionado.'); };
  return <div className="page"><div className="actions"><button className="primary" onClick={add}>Adicionar Fornecedor</button></div><section className="panel"><h3>Fornecedores</h3><div className="suppliers">{suppliers.map((f) => <div key={f.id}><b>{f.nome}</b><span>{f.contato}</span><span>{f.categoria}</span><Tag s={f.status === 'Ativo' ? 'Em Estoque' : 'Estoque Baixo'} /></div>)}</div></section></div>;
}

function Configuracoes({ settings, setSettings }) {
  const toggle = (key) => setSettings((s) => ({ ...s, [key]: !s[key] }));
  return <div className="page"><section className="panel"><h3>Configurações</h3>{[['estoque', 'Baixa automática de estoque'], ['recibo', 'Imprimir recibo ao finalizar'], ['imposto', 'Aplicar imposto de 10% no PDV']].map(([key, label]) => <label className="switch" key={key}><span>{label}</span><input type="checkbox" checked={settings[key]} onChange={() => toggle(key)} /></label>)}</section></div>;
}

export default App;
