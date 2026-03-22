import React, { useState, useEffect } from "react";
import "./ProductsPage.scss";
import ProductsList from "../../components/ProductsList";
import ProductModal from "../../components/ProductModal";
import { api } from "../../api";
import { getUserRole, logout } from "../../api/auth";
import { useNavigate } from 'react-router-dom';

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingProduct, setEditingProduct] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const role = getUserRole();
    setUserRole(role);
    loadProducts();
  }, []);

  const canEditProducts = userRole === 'seller' || userRole === 'admin';
  const canEdit = userRole === 'seller' || userRole === 'admin';
  const canDelete = userRole === 'admin';
  const canManageUsers = userRole === 'admin';

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await api.getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      alert("Ошибка загрузки товаров");
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setModalMode("create");
    setEditingProduct(null);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setModalMode("edit");
    setEditingProduct(product);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm("Удалить товар");
    if (!ok) return;

    try {
      await api.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
      alert("Ошибка удаления товара");
    }
  };

  const handleSubmitModal = async (payload) => {
  console.log("🔵 Отправляем в API:", JSON.stringify(payload, null, 2)); // ← ДОБАВЬТЕ
  
  try {
    if (modalMode === "create") {
      const newProduct = await api.createProduct(payload);
      setProducts((prev) => [...prev, newProduct]);
    } else {
      console.log("🔵 Обновляем товар ID:", payload.id); // ← ДОБАВЬТЕ
      const updatedProduct = await api.updateProduct(payload.id, payload);
      setProducts((prev) =>
        prev.map((p) => (p.id === payload.id ? updatedProduct : p))
      );
    }
    closeModal();
  } catch (err) {
    console.error("🔴 Ошибка:", err.response?.data); // ← ПОСМОТРИТЕ ЭТО!
    console.error("🔴 Статус:", err.response?.status);
    alert("Ошибка сохранения товара: " + (err.response?.data?.error || "Неизвестная ошибка"));
  }
};

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goToUsers = () => {
    navigate('/users');
  };



  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">Спорт-магазин</div>
          <div className="header__right">
            Роль: {userRole}
            {canManageUsers && (
              <button className="btn" onClick={goToUsers} style={{ marginLeft: '10px' }}>
                👥 Пользователи
              </button>
            )}
            <button className="btn" onClick={handleLogout} style={{ marginLeft: '10px' }}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <div className="toolbar">
            <h1 className="title">Спортивные товары</h1>
            {canEditProducts && (
              <button className="btn btn--primary" onClick={openCreate}>
                + Добавить товар
              </button>
            )}
          </div>

          {loading ? (
            <div className="empty">Загрузка...</div>
          ) : (
            <ProductsList
              products={products}
              onEdit={openEdit}           // ← всегда передаем функцию
              onDelete={handleDelete}     // ← всегда передаем функцию
              canEdit={canEdit}           // ← передаем права отдельно
              canDelete={canDelete}       // ← передаем права отдельно
            />
          )}
        </div>
      </main>

      {modalOpen && (
        <ProductModal
          open={modalOpen}
          mode={modalMode}
          initialProduct={editingProduct}
          onClose={closeModal}
          onSubmit={handleSubmitModal}
        />
      )}
    </div>
  );
}