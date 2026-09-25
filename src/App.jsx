import { useMemo, useState, useEffect } from "react";
import {
  Search, ArrowUpDown, ChevronDown, Package, Tags,
  ChevronLeft, ChevronRight, Grid3x3, LayoutPanelLeft,
  Star, ArrowUpWideNarrow, ArrowDownWideNarrow, Sparkles, User
} from "lucide-react";
import productsData from "./products.json";

// Build filter options directly from the loaded dataset
const CATEGORIES = [...new Set(productsData.map((p) => p.category))];
const DEPARTMENTS = ["All", ...new Set(productsData.map((p) => p.department))];
const PAGE_SIZES = [16, 24, 48];

// --------------------------------------------
// CHILD COMPONENT — Single Product Card
// --------------------------------------------
function ProductCard({ product, onAdd }) {
  const outOfStock = product.stock <= 0;
  return (
    <article className="group relative flex flex-col rounded-2xl border border-white/8 bg-white/[0.03] p-5 backdrop-blur-sm
      transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/40 hover:shadow-[0_20px_50px_-20px_rgba(34,211,238,0.35)]">
      <div className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-cyan-500/10 blur-3xl transition-opacity duration-300 opacity-0 group-hover:opacity-100" />

      <div className="mb-4 flex items-start justify-between">
        <span className="grid h-14 w-14 place-items-center rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 text-3xl ring-1 ring-white/10">
          {product.image}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-amber-400/10 px-2.5 py-1 text-xs font-medium text-amber-300 ring-1 ring-amber-400/20">
          <Star className="h-3 w-3 fill-amber-300" /> {product.rating.toFixed(1)}
        </span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-[11px] font-medium text-cyan-300 ring-1 ring-cyan-400/20">
          {product.category}
        </span>
        <span className="rounded-full bg-slate-400/10 px-2 py-0.5 text-[11px] font-medium text-slate-300 ring-1 ring-slate-400/20">
          {product.department}
        </span>
        {product.tags.map((t) => (
          <span key={t} className="rounded-full bg-violet-400/10 px-2 py-0.5 text-[11px] font-medium capitalize text-violet-300 ring-1 ring-violet-400/20">
            {t}
          </span>
        ))}
      </div>

      <h3 className="mt-3 text-base font-semibold text-slate-100">{product.name}</h3>
      <p className="mt-1 text-sm text-slate-400">SKU-{product.id.toString().padStart(4, "0")}</p>

      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] uppercase tracking-wider text-slate-500">Price</p>
          <p className="text-xl font-bold text-white">${product.price.toFixed(2)}</p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(product); }}
          disabled={outOfStock}
          className="rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-4 py-2 text-sm font-semibold text-white
            shadow-lg shadow-cyan-500/20 transition-all hover:shadow-cyan-400/40 disabled:cursor-not-allowed disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:shadow-none">
          {outOfStock ? "Sold Out" : "Add"}
        </button>
      </div>

      {outOfStock && (
        <div className="absolute right-3 top-3 rounded-md bg-rose-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-300 ring-1 ring-rose-500/30">
          Out of stock
        </div>
      )}
    </article>
  );
}

// --------------------------------------------
// MAIN APP
// --------------------------------------------
export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [department, setDepartment] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(16);
  const [view, setView] = useState("grid");

  // Load the JSON dataset (async so the skeleton loader shows)
  useEffect(() => {
    const t = setTimeout(() => { setProducts(productsData); setLoading(false); }, 600);
    return () => clearTimeout(t);
  }, []);

  // FILTER + SORT — the core logic
  const filtered = useMemo(() => {
    let list = [...products];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.department.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }
    if (category !== "All") list = list.filter((p) => p.category === category);
    if (department !== "All") list = list.filter((p) => p.department === department);

    const dir = sortDir === "asc" ? 1 : -1;
    list.sort((a, b) => {
      const va = a[sortKey], vb = b[sortKey];
      if (typeof va === "string") return va.localeCompare(vb) * dir;
      return (va - vb) * dir;
    });
    return list;
  }, [products, query, category, department, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paged = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const inStock = filtered.filter((p) => p.stock > 0).length;
  const avgRating = filtered.length ? (filtered.reduce((s, p) => s + p.rating, 0) / filtered.length).toFixed(1) : "0";

  const toggleDir = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
    setPage(1);
  };

  const handleAdd = (product) => console.log("Added:", product.name);

  const stats = [
    { label: "Products", value: filtered.length, icon: Package, tint: "from-cyan-500/20 to-cyan-500/0", ring: "ring-cyan-400/20" },
    { label: "In Stock", value: inStock, icon: Tags, tint: "from-emerald-500/20 to-emerald-500/0", ring: "ring-emerald-400/20" },
    { label: "Avg Rating", value: avgRating + " ★", icon: Star, tint: "from-amber-500/20 to-amber-500/0", ring: "ring-amber-400/20" },
  ];

  const columns = [
    { key: "name", label: "Product" },
    { key: "category", label: "Category" },
    { key: "department", label: "Department" },
    { key: "price", label: "Price" },
    { key: "rating", label: "Rating" },
    { key: "stock", label: "Stock" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-cyan-500/30">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/4 h-96 w-96 rounded-full bg-cyan-600/10 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 h-96 w-96 rounded-full bg-blue-700/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* ---------- HEADER ---------- */}
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-400">
              <Sparkles className="h-4 w-4" /> Catalog Explorer
            </div>
            <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">Data Display <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Grid</span></h1>
            <p className="mt-1 text-sm text-slate-400">240 items across 8 categories — fetch, filter, sort and paginate in real time.</p>
          </div>

          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/[0.04] p-1">
            <button onClick={() => setView("grid")} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${view === "grid" ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 ring-1 ring-cyan-400/30" : "text-slate-400 hover:text-slate-200"}`}>
              <Grid3x3 className="h-4 w-4" /> Grid
            </button>
            <button onClick={() => setView("table")} className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${view === "table" ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 ring-1 ring-cyan-400/30" : "text-slate-400 hover:text-slate-200"}`}>
              <LayoutPanelLeft className="h-4 w-4" /> Table
            </button>
          </div>
        </header>

        {/* ---------- STATS ---------- */}
        <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {stats.map((s) => (
            <div key={s.label} className={`relative overflow-hidden rounded-2xl border border-white/8 bg-gradient-to-br ${s.tint} p-5 ring-1 ${s.ring}`}>
              <s.icon className="absolute -right-3 -top-3 h-20 w-20 text-white/5" />
              <p className="text-sm text-slate-400">{s.label}</p>
              <p className="mt-1 text-3xl font-bold text-white">{s.value}</p>
            </div>
          ))}
        </section>

        {/* ---------- TOOLBAR ---------- */}
        <section className="mt-8 rounded-2xl border border-white/8 bg-white/[0.03] p-4 backdrop-blur-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="relative md:col-span-2 xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search name, category, department or SKU…"
                className="w-full rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-10 pr-4 text-sm text-slate-200
                  placeholder:text-slate-500 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20"
              />
            </label>

            <div className="relative">
              <Tags className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <select
                value={category}
                onChange={(e) => { setCategory(e.target.value); setPage(1); }}
                className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-10 pr-9 text-sm text-slate-200 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (<option key={c} value={c}>{c}</option>))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>

            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <select
                value={department}
                onChange={(e) => { setDepartment(e.target.value); setPage(1); }}
                className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-10 pr-9 text-sm text-slate-200 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
                {DEPARTMENTS.map((d) => (<option key={d} value={d}>{d === "All" ? "All Departments" : d}</option>))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>

            <div className="relative">
              <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <select
                value={sortKey + ":" + sortDir}
                onChange={(e) => { const [k, d] = e.target.value.split(":"); setSortKey(k); setSortDir(d); setPage(1); }}
                className="w-full appearance-none rounded-xl border border-white/10 bg-slate-900/70 py-2.5 pl-10 pr-9 text-sm text-slate-200 focus:border-cyan-400/50 focus:outline-none focus:ring-2 focus:ring-cyan-400/20">
                <option value="name:asc">Name A–Z</option>
                <option value="name:desc">Name Z–A</option>
                <option value="category:asc">Category A–Z</option>
                <option value="price:asc">Price ↑ Low–High</option>
                <option value="price:desc">Price ↓ High–Low</option>
                <option value="rating:desc">Rating ↓ High–Low</option>
                <option value="stock:desc">Stock ↓ High–Low</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
        </section>

        {/* ---------- CONTENT ---------- */}
        {loading ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-2xl border border-white/5 bg-white/[0.03]" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="mt-10 grid place-items-center rounded-2xl border border-dashed border-white/10 py-20 text-center">
            <p className="text-4xl">🔍</p>
            <p className="mt-3 text-lg font-semibold text-slate-200">No products match your filters</p>
            <p className="mt-1 text-sm text-slate-400">Try clearing the search or choosing a different category.</p>
            <button
              onClick={() => { setQuery(""); setCategory("All"); setDepartment("All"); setPage(1); }}
              className="mt-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-5 py-2 text-sm font-semibold text-white hover:opacity-90">
              Clear Filters
            </button>
          </div>
        ) : view === "grid" ? (
          <section className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {paged.map((p) => <ProductCard key={p.id} product={p} onAdd={handleAdd} />)}
          </section>
        ) : (
          <section className="mt-8 overflow-x-auto rounded-2xl border border-white/8 bg-white/[0.02]">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-slate-400">
                  {columns.map((c) => (
                    <th key={c.key} className="px-4 py-3">
                      <button onClick={() => toggleDir(c.key)} className="flex items-center gap-1.5 hover:text-slate-200">
                        {c.label}
                        {sortKey === c.key && (sortDir === "asc"
                          ? <ArrowUpWideNarrow className="h-3.5 w-3.5 text-cyan-400" />
                          : <ArrowDownWideNarrow className="h-3.5 w-3.5 text-cyan-400" />)}
                        {sortKey !== c.key && <ArrowUpDown className="h-3.5 w-3.5 opacity-40" />}
                      </button>
                    </th>
                  ))}
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p) => (
                  <tr key={p.id} className="border-b border-white/5 transition-colors hover:bg-white/[0.03]">
                    <td className="px-4 py-3 font-medium text-slate-100">{p.image} {p.name}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-full bg-cyan-400/10 px-2 py-0.5 text-xs text-cyan-300 ring-1 ring-cyan-400/20">{p.category}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.department}</td>
                    <td className="px-4 py-3 text-slate-200">${p.price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-amber-300">{p.rating} ★</td>
                    <td className={`px-4 py-3 ${p.stock <= 0 ? "text-rose-400" : p.stock < 15 ? "text-amber-300" : "text-emerald-300"}`}>
                      {p.stock <= 0 ? "Out" : p.stock}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => handleAdd(p)} className="rounded-lg bg-gradient-to-r from-cyan-500 to-blue-500 px-3 py-1 text-xs font-semibold text-white hover:opacity-90">Add</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {/* ---------- PAGINATION ---------- */}
        <section className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/[0.03] p-4 sm:flex-row">
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span>Rows per page</span>
            <select
              value={pageSize}
              onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
              className="rounded-lg border border-white/10 bg-slate-900/70 px-2 py-1 text-slate-200 focus:outline-none">
              {PAGE_SIZES.map((s) => (<option key={s} value={s}>{s}</option>))}
            </select>
            <span className="ml-2">
              Showing <span className="font-semibold text-slate-200">{filtered.length ? (safePage - 1) * pageSize + 1 : 0}</span>–
              <span className="font-semibold text-slate-200">{Math.min(safePage * pageSize, filtered.length)}</span> of{" "}
              <span className="font-semibold text-slate-200">{filtered.length}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={() => setPage(safePage - 1)} disabled={safePage <= 1}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`h-9 w-9 rounded-xl text-sm font-semibold transition ${safePage === i + 1
                  ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25"
                  : "border border-white/10 text-slate-400 hover:text-white hover:border-white/25"}`}>
                {i + 1}
              </button>
            ))}
            <button onClick={() => setPage(safePage + 1)} disabled={safePage >= totalPages}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-slate-300 transition hover:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}