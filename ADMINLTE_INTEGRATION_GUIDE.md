# 🎨 Guia de Integração AdminLTE 4 + React

## ✅ O que foi instalado

### 1. Assets do AdminLTE 4
- ✅ CSS: `client/public/assets/adminlte/css/adminlte.min.css`
- ✅ JS: `client/public/assets/adminlte/js/adminlte.min.js`

### 2. Bootstrap 5 (via CDN)
- ✅ CSS e JS adicionados no `client/index.html`
- ✅ Bootstrap Icons incluídos

### 3. Componente Layout
- ✅ `client/src/components/AdminLTELayout.tsx` criado
- ✅ Estrutura completa do AdminLTE (navbar, sidebar, content, footer)

---

## 🚀 Como usar nas suas páginas

### Exemplo Básico

```tsx
import { AdminLTELayout } from '@/components/AdminLTELayout';

export default function MinhaPage() {
  return (
    <AdminLTELayout pageTitle="Minha Página">
      {/* Seu conteúdo React aqui */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Título do Card</h3>
            </div>
            <div className="card-body">
              Conteúdo do seu componente React
            </div>
          </div>
        </div>
      </div>
    </AdminLTELayout>
  );
}
```

### Com Breadcrumbs

```tsx
<AdminLTELayout 
  pageTitle="Dashboard" 
  breadcrumbs={[
    { label: 'Home', href: '/' },
    { label: 'Relatórios', href: '/reports' },
    { label: 'Dashboard' }
  ]}
>
  {/* Seu conteúdo */}
</AdminLTELayout>
```

---

## 📦 Componentes AdminLTE Disponíveis

### Small Boxes (Widgets de Estatísticas)
```tsx
<div className="small-box text-bg-primary">
  <div className="inner">
    <h3>150</h3>
    <p>Novos Pedidos</p>
  </div>
  <a href="#" className="small-box-footer">
    Mais informações <i className="bi bi-link-45deg"></i>
  </a>
</div>
```

Variantes: `text-bg-primary`, `text-bg-success`, `text-bg-warning`, `text-bg-danger`, `text-bg-info`

### Cards
```tsx
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Título</h3>
  </div>
  <div className="card-body">
    Conteúdo
  </div>
  <div className="card-footer">
    Rodapé (opcional)
  </div>
</div>
```

### Tabelas
```tsx
<table className="table table-striped">
  <thead>
    <tr>
      <th>Coluna 1</th>
      <th>Coluna 2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Dado 1</td>
      <td>Dado 2</td>
    </tr>
  </tbody>
</table>
```

### Badges
```tsx
<span className="badge bg-success">Ativo</span>
<span className="badge bg-warning">Pendente</span>
<span className="badge bg-danger">Inativo</span>
```

### Botões Bootstrap
```tsx
<button className="btn btn-primary">Primário</button>
<button className="btn btn-success">Sucesso</button>
<button className="btn btn-warning">Aviso</button>
<button className="btn btn-danger">Perigo</button>
<button className="btn btn-info">Info</button>

{/* Tamanhos */}
<button className="btn btn-sm btn-primary">Pequeno</button>
<button className="btn btn-lg btn-primary">Grande</button>
```

---

## 🎯 Adaptar Páginas Existentes

### Opção 1: Wrapper Simples (Recomendado)
Envolva o conteúdo existente sem alterar a lógica:

```tsx
// Antes
export default function Dashboard() {
  return (
    <div>
      {/* Seu conteúdo React existente */}
    </div>
  );
}

// Depois
import { AdminLTELayout } from '@/components/AdminLTELayout';

export default function Dashboard() {
  return (
    <AdminLTELayout pageTitle="Dashboard">
      {/* Seu conteúdo React existente - SEM ALTERAÇÕES */}
    </AdminLTELayout>
  );
}
```

### Opção 2: Substituir Componentes Gradualmente
Troque seus Cards/Tabelas por versões AdminLTE:

```tsx
// Antes (shadcn)
import { Card, CardHeader, CardContent } from "@/components/ui/card";

<Card>
  <CardHeader>Título</CardHeader>
  <CardContent>Conteúdo</CardContent>
</Card>

// Depois (AdminLTE)
<div className="card">
  <div className="card-header">
    <h3 className="card-title">Título</h3>
  </div>
  <div className="card-body">
    Conteúdo
  </div>
</div>
```

---

## 🔧 Personalizações

### Alterar o Sidebar
Edite `client/src/components/AdminLTELayout.tsx`:

```tsx
{/* Adicione novos itens de menu */}
<li className="nav-item">
  <a href="/sua-rota" className="nav-link">
    <i className="nav-icon bi bi-star"></i>
    <p>Seu Menu</p>
  </a>
</li>
```

### Alterar a Navbar
No mesmo arquivo, seção `<nav className="app-header">`:

```tsx
{/* Adicione botões/dropdowns */}
<li className="nav-item">
  <a className="nav-link" href="#">
    <i className="bi bi-gear"></i>
  </a>
</li>
```

### Alterar o Footer
No mesmo arquivo, seção `<footer className="app-footer">`:

```tsx
<footer className="app-footer">
  <div className="float-end">Sua empresa</div>
  <strong>Copyright &copy; 2025</strong>
</footer>
```

---

## 📚 Documentação Oficial

- **AdminLTE 4**: https://adminlte.io/docs/4.0/
- **Bootstrap 5**: https://getbootstrap.com/docs/5.3/
- **Bootstrap Icons**: https://icons.getbootstrap.com/

---

## 🧪 Testar a Integração

Uma página de exemplo foi criada em:
- `client/src/pages/adminlte-example.tsx`

Para testá-la, adicione a rota no `App.tsx`:

```tsx
import AdminLTEExample from "@/pages/adminlte-example";

// No Router:
<Route path="/adminlte-example" component={AdminLTEExample} />
```

---

## ⚠️ Regras Importantes

### ✅ PODE fazer:
- Usar `AdminLTELayout` como wrapper das suas páginas
- Adicionar seus componentes React dentro do layout
- Misturar componentes AdminLTE com seus componentes React
- Personalizar o sidebar/navbar/footer no `AdminLTELayout.tsx`

### ❌ NÃO PODE fazer:
- Remover IDs ou `data-testid` dos seus componentes existentes
- Quebrar a lógica de negócio dos seus scripts
- Modificar as rotas do backend
- Apagar funções JavaScript importantes

---

## 🎨 Classes CSS Úteis

### Grid System (Bootstrap)
```tsx
<div className="row">
  <div className="col-md-6">Metade</div>
  <div className="col-md-6">Metade</div>
</div>

<div className="row">
  <div className="col-lg-3 col-md-6">25%</div>
  <div className="col-lg-9 col-md-6">75%</div>
</div>
```

### Espaçamento
```tsx
<div className="mt-4">Margin Top 4</div>
<div className="mb-3">Margin Bottom 3</div>
<div className="p-3">Padding 3</div>
```

### Cores de Texto
```tsx
<p className="text-primary">Azul</p>
<p className="text-success">Verde</p>
<p className="text-danger">Vermelho</p>
<p className="text-warning">Amarelo</p>
```

---

## 📝 Próximos Passos

1. ✅ **Teste o layout**: Acesse `/adminlte-example` para ver o layout funcionando
2. 🔄 **Adapte uma página**: Escolha uma página simples e envolva com `<AdminLTELayout>`
3. 🎨 **Personalize**: Ajuste cores, sidebar e navbar conforme necessário
4. 📦 **Migre gradualmente**: Vá página por página sem pressa

---

**Dúvidas?** Consulte a documentação oficial do AdminLTE 4 ou peça ajuda!
