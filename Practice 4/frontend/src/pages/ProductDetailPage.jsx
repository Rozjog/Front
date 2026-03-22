import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await api.getProductById(id);
      setProduct(data);
    } catch (err) {
      console.error(err);
      setError('Товар не найден');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="empty">Загрузка...</div>;
  if (error) return <div className="empty">{error}</div>;
  if (!product) return <div className="empty">Товар не найден</div>;

  return (
    <div className="page">
      <header className="header">
        <div className="header__inner">
          <div className="brand">Спорт-магазин</div>
          <button className="btn" onClick={() => navigate('/products')}>
            ← Назад к товарам
          </button>
        </div>
      </header>

      <main className="main">
        <div className="container" style={{ maxWidth: '800px' }}>
          <div className="productDetail">
            {product.image && (
              <img
                src={product.image}
                alt={product.name}
                style={{
                  width: '300px',
                  height: '300px',
                  objectFit: 'cover',
                  borderRadius: '16px',
                  marginBottom: '20px'
                }}
              />
            )}
            
            <h1 className="productName" style={{ fontSize: '28px', marginBottom: '10px' }}>
              {product.name}
            </h1>
            
            <div className="productCategory" style={{ marginBottom: '15px' }}>
              📁 {product.category}
            </div>
            
            <div className="productPrice" style={{ fontSize: '32px', color: '#4ade80', marginBottom: '15px' }}>
              {product.price?.toLocaleString()} ₽
            </div>
            
            <div className="productStock" style={{ marginBottom: '20px' }}>
              📦 Осталось: {product.stock} шт.
            </div>
            
            <div className="productDescription" style={{ lineHeight: '1.6' }}>
              <h3>Описание:</h3>
              <p>{product.description}</p>
            </div>
            
            <div className="productId" style={{ marginTop: '20px', fontSize: '12px', opacity: 0.5 }}>
              ID: {product.id}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}