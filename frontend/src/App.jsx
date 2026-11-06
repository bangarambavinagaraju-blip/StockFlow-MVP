import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard, Package, Settings, Search, Bell, Plus,
  AlertTriangle, Boxes, DollarSign, Pencil, Trash2, X,
  LogOut, UserRound, Building2, ShieldCheck
} from "lucide-react";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import api from "./api";
import "./App.css";

function Dashboard() {
  const navigate = useNavigate();

  const [activePage, setActivePage] = useState("Dashboard");
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [currentUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("stockflow_user") || "{}");
    } catch {
      return {};
    }
  });

  const userEmail = currentUser.email || "User";
  const organizationName = currentUser.organization_name || "My Organization";
  const userInitial = userEmail.charAt(0).toUpperCase() || "U";

  const emptyForm = {
    name: "",
    sku: "",
    description: "",
    quantity: "",
    cost_price: "",
    selling_price: "",
    low_stock_threshold: "5"
  };

  const [form, setForm] = useState(emptyForm);

  const logout = () => {
    localStorage.removeItem("stockflow_token");
    localStorage.removeItem("stockflow_user");
    navigate("/login", { replace: true });
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/products");
      setProducts(response.data?.data || []);
    } catch (err) {
      console.error("Fetch error:", err.response?.data || err);
      setError(
        err.response?.data?.message ||
        "Unable to load products. Check your backend connection."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const totalProducts = products.length;

  const totalQuantity = products.reduce(
    (sum, product) => sum + Number(product.quantity || 0), 0
  );

  const inventoryValue = products.reduce(
    (sum, product) =>
      sum + Number(product.quantity || 0) *
      Number(product.selling_price || 0), 0
  );

  const lowStockProducts = products.filter(
    product =>
      Number(product.quantity || 0) <=
      Number(product.low_stock_threshold ?? 5)
  );

  const filteredProducts = products.filter(product =>
    `${product.name || ""} ${product.sku || ""}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const openAddModal = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowModal(true);
  };

  const openEditModal = product => {
    setEditingId(product.id);
    setForm({
      name: product.name || "",
      sku: product.sku || "",
      description: product.description || "",
      quantity: String(product.quantity ?? ""),
      cost_price: String(product.cost_price ?? ""),
      selling_price: String(product.selling_price ?? ""),
      low_stock_threshold: String(product.low_stock_threshold ?? 5)
    });
    setShowModal(true);
  };

  const handleSaveProduct = async event => {
    event.preventDefault();

    const quantity = Number(form.quantity);
    const costPrice = Number(form.cost_price);
    const sellingPrice = Number(form.selling_price);
    const threshold = Number(form.low_stock_threshold);

    if (
      !form.name.trim() ||
      !form.sku.trim() ||
      form.quantity === "" ||
      form.cost_price === "" ||
      form.selling_price === "" ||
      !Number.isInteger(quantity) ||
      quantity < 0 ||
      !Number.isFinite(costPrice) ||
      costPrice < 0 ||
      !Number.isFinite(sellingPrice) ||
      sellingPrice < 0 ||
      !Number.isInteger(threshold) ||
      threshold < 0
    ) {
      alert("Please enter valid product details.");
      return;
    }

    const productData = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      quantity,
      cost_price: costPrice,
      selling_price: sellingPrice,
      low_stock_threshold: threshold
    };

    try {
      setSaving(true);

      if (editingId !== null) {
        await api.put(`/products/${editingId}`, productData);
        alert("Product updated successfully!");
      } else {
        await api.post("/products", productData);
        alert("Product added successfully!");
      }

      setShowModal(false);
      setForm({ ...emptyForm });
      setEditingId(null);
      await fetchProducts();

    } catch (err) {
      console.error("Save error:", err.response?.data || err);
      alert(
        err.response?.data?.message ||
        "Unable to save product. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async id => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/products/${id}`);
      alert("Product deleted successfully!");
      await fetchProducts();
    } catch (err) {
      console.error("Delete error:", err.response?.data || err);
      alert("Unable to delete product.");
    }
  };

  const renderLoadingOrError = () => {
    if (loading) {
      return <p className="empty-message">Loading products...</p>;
    }

    if (error) {
      return (
        <div className="empty-message">
          <p>{error}</p>
          <button className="secondary-button" onClick={fetchProducts}>
            Try Again
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="app-container">

      <aside className="sidebar">

        <div className="brand">
          <div className="brand-icon"><Boxes size={25} /></div>
          <div>
            <h2>StockFlow</h2>
            <span>INVENTORY MANAGEMENT</span>
          </div>
        </div>

        <p className="nav-heading">WORKSPACE</p>

        <nav>
          <button
            className={activePage === "Dashboard" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("Dashboard")}
          >
            <LayoutDashboard size={19} />
            Dashboard
          </button>

          <button
            className={activePage === "Products" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("Products")}
          >
            <Package size={19} />
            Products
          </button>
        </nav>

        <div className="sidebar-bottom">

          <button
            className={activePage === "Settings" ? "nav-item active" : "nav-item"}
            onClick={() => setActivePage("Settings")}
          >
            <Settings size={19} />
            Settings
          </button>

          <div className="profile">
            <div className="avatar">{userInitial}</div>

            <div className="profile-info">
              <strong>{userEmail}</strong>
              <span>{organizationName}</span>
            </div>

            <button
              className="icon-button"
              title="Logout"
              onClick={logout}
            >
              <LogOut size={17} />
            </button>
          </div>

        </div>
      </aside>

      <main className="main-content">

        <header className="topbar">
          <div>
            <h2>{activePage}</h2>
            <p>
              {activePage === "Settings"
                ? "Manage your account and preferences."
                : "Welcome back! Here's your inventory overview."}
            </p>
          </div>

          <div className="topbar-actions">
            <div className="search-box">
              <Search size={17} />
              <input
                placeholder="Search products..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <button className="notification">
              <Bell size={19} />
            </button>

            <div className="top-avatar">{userInitial}</div>
          </div>
        </header>

       <div className="page-content">

          {activePage === "Dashboard" && (
            <>
              <div className="welcome-section">
                <div>
                  <h1>Inventory Overview</h1>
                  <p>Monitor your products and stock levels in one place.</p>
                </div>

                <button className="primary-button" onClick={openAddModal}>
                  <Plus size={18} />
                  Add Product
                </button>
              </div>

              {loading ? (
                <p className="empty-message">Loading dashboard...</p>
              ) : error ? (
                <div className="empty-message">
                  <p>{error}</p>
                  <button className="secondary-button" onClick={fetchProducts}>
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  <section className="stats-grid">

                    <div className="stat-card">
                      <div className="stat-icon blue"><Package /></div>
                      <p>Total Products</p>
                      <h2>{totalProducts}</h2>
                      <span>Registered products</span>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon purple"><Boxes /></div>
                      <p>Total Stock Quantity</p>
                      <h2>{totalQuantity}</h2>
                      <span>Units available</span>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon green"><DollarSign /></div>
                      <p>Inventory Value</p>
                      <h2>₹{inventoryValue.toLocaleString("en-IN")}</h2>
                      <span>Based on selling prices</span>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon orange"><AlertTriangle /></div>
                      <p>Low Stock Items</p>
                      <h2>{lowStockProducts.length}</h2>
                      <span>Require attention</span>
                    </div>

                  </section>

                  <section className="content-card">
                    <div className="section-header">
                      <div>
                        <h3>Low Stock Alerts</h3>
                        <p>Products that need replenishment</p>
                      </div>
                      <AlertTriangle size={21} />
                    </div>

                    {lowStockProducts.length === 0 ? (
                      <p className="empty-message">
                        All products have sufficient stock.
                      </p>
                    ) : (
                      lowStockProducts.map(product => (
                        <div className="low-stock-item" key={product.id}>
                          <div>
                            <strong>{product.name}</strong>
                            <span>SKU: {product.sku}</span>
                          </div>
                          <span className="stock-warning">
                            {product.quantity} units left
                          </span>
                        </div>
                      ))
                    )}
                  </section>
                </>
              )}
            </>
          )}

          {activePage === "Products" && (
            <section className="content-card">

              <div className="section-header">
                <div>
                  <h3>Product Management</h3>
                  <p>Manage your inventory products</p>
                </div>

                <button className="primary-button" onClick={openAddModal}>
                  <Plus size={18} />
                  Add Product
                </button>
              </div>

              {loading || error ? (
                renderLoadingOrError()
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>PRODUCT</th>
                        <th>SKU</th>
                        <th>QUANTITY</th>
                        <th>PRICE</th>
                        <th>STOCK STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>

                    <tbody>
                      {filteredProducts.map(product => {
                        const isLowStock =
                          Number(product.quantity) <=
                          Number(product.low_stock_threshold ?? 5);

                        return (
                          <tr key={product.id}>
                            <td><strong>{product.name}</strong></td>
                            <td>{product.sku}</td>
                            <td>{product.quantity}</td>
                            <td>
                              ₹{Number(product.selling_price || 0).toLocaleString("en-IN")}
                            </td>
                            <td>
                              <span className={isLowStock ? "badge low" : "badge healthy"}>
                                {isLowStock ? "Low Stock" : "In Stock"}
                              </span>
                            </td>
                            <td>
                              <button
                                className="icon-button"
                                onClick={() => openEditModal(product)}
                                title="Edit product"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                className="icon-button delete"
                                onClick={() => deleteProduct(product.id)}
                                title="Delete product"
                              >
                                <Trash2 size={17} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {filteredProducts.length === 0 && (
                    <p className="empty-message">No products found.</p>
                  )}
                </div>
              )}
            </section>
          )}

          {activePage === "Settings" && (
            <div className="settings-container">

              <section className="content-card">
                <div className="section-header">
                  <div>
                    <h3>Account Settings</h3>
                    <p>Your StockFlow account information.</p>
                  </div>
                  <UserRound size={22} />
                </div>

                <div className="settings-section">
                  <div className="settings-item">
                    <label>Email Address</label>
                    <p>{userEmail}</p>
                  </div>

                  <div className="settings-item">
                    <label>Organization Name</label>
                    <p>{organizationName}</p>
                  </div>

                  <div className="settings-item">
                    <label>Account Status</label>
                    <span className="badge healthy">Signed in</span>
                  </div>
                </div>
              </section>

              <section className="content-card">
                <div className="section-header">
                  <div>
                    <h3>Inventory Preferences</h3>
                    <p>Default inventory preferences.</p>
                  </div>
                  <Package size={22} />
                </div>

                <div className="settings-section">
                  <div className="settings-item">
                    <label>Default Low Stock Threshold</label>
                    <p>5 units (display default)</p>
                  </div>

                  <div className="settings-item">
                    <label>Currency</label>
                    <p>Indian Rupee (₹)</p>
                  </div>

                  <div className="settings-item">
                    <label>Application</label>
                    <p>StockFlow Inventory Management</p>
                  </div>
                </div>
              </section>

              <section className="content-card">
                <div className="section-header">
                  <div>
                    <h3>Organization</h3>
                    <p>Your current workspace.</p>
                  </div>
                  <Building2 size={22} />
                </div>

                <div className="settings-item">
                  <label>Workspace Name</label>
                  <p>{organizationName}</p>
                </div>
              </section>

              <section className="content-card">
                <div className="section-header">
                  <div>
                    <h3>Security & Session</h3>
                    <p>Manage your current session.</p>
                  </div>
                  <ShieldCheck size={22} />
                </div>

                <button className="primary-button" onClick={logout}>
                  <LogOut size={17} />
                  Logout
                </button>
              </section>

            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal">

            <div className="modal-header">
              <div>
                <h2>
                  {editingId !== null ? "Edit Product" : "Add New Product"}
                </h2>
                <p>Enter the product information.</p>
              </div>

              <button
                className="icon-button"
                onClick={() => setShowModal(false)}
                type="button"
              >
                <X />
              </button>
            </div>

            <form onSubmit={handleSaveProduct}>
              <label>Product Name</label>
              <input
                required
                placeholder="Enter product name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />

              <label>SKU</label>
              <input
                required
                placeholder="Enter unique SKU"
                value={form.sku}
                onChange={e => setForm({ ...form, sku: e.target.value })}
              />

              <label>Description</label>
              <input
                placeholder="Product description"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />

              <div className="form-row">
                <div>
                  <label>Quantity</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    placeholder="0"
                    value={form.quantity}
                    onChange={e => setForm({ ...form, quantity: e.target.value })}
                  />
                </div>

                <div>
                  <label>Cost Price (₹)</label>
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0"
                    value={form.cost_price}
                    onChange={e => setForm({ ...form, cost_price: e.target.value })}
                  />
                </div>
              </div>

              <label>Selling Price (₹)</label>
              <input
                required
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={form.selling_price}
                onChange={e => setForm({ ...form, selling_price: e.target.value })}
              />

              <label>Low Stock Threshold</label>
              <input
                required
                type="number"
                min="0"
                step="1"
                value={form.low_stock_threshold}
                onChange={e => setForm({ ...form, low_stock_threshold: e.target.value })}
              />

              <button
                type="submit"
                className="primary-button submit-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingId !== null
                    ? "Update Product"
                    : "Save Product"}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("stockflow_token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;              