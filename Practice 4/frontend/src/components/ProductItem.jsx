import React from "react";

export default function ProductItem({ product, onEdit, onDelete }) {
  return (
    <div className="productRow">
      <div className="productMain">
        <div className="productId">#{product.id}</div>
        <div className="productName">{product.name}</div>
        <div className="productCategory">{product.category}</div>
        <div className="productPrice">{product.price.toLocaleString()} ₽</div>
        <div className="productStock">Осталось: {product.stock} шт.</div>
        <div className="productDescription">{product.description}</div>
        {product.image && (
          <img
            src={product.image}
            alt={product.name}
            style={{
              width: '100px',
              height: '100px',
              objectFit: 'cover',
              borderRadius: '8px'
            }}
          />
        )}
      </div>

      <div className="productActions">
        <button className="btn" onClick={() => onEdit(product)}>
          Редактировать
        </button>
        <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
          Удалить
        </button>
      </div>
    </div>
  );
}