import { Link } from 'react-router-dom';

export default function ProductItem({ product, onEdit, onDelete, canEdit, canDelete }) {
  return (
    <div className="productRow">
      <div className="productMain">
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
        
        <div className="productInfo">
          <div className="productId">#{product.id}</div>
          <Link 
            to={`/products/${product.id}`} 
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="productName" style={{ cursor: 'pointer', color: '#4ade80' }}>
              {product.name} →
            </div>
          </Link>
          <div className="productCategory">{product.category}</div>
          <div className="productPrice">{product.price?.toLocaleString()} ₽</div>
          <div className="productStock">Осталось: {product.stock} шт.</div>
          <div className="productDescription">{product.description?.substring(0, 100)}...</div>
        </div>
      </div>

      <div className="productActions">
        {canEdit && (
          <button className="btn" onClick={() => onEdit(product)}>
            Редактировать
          </button>
        )}
        {canDelete && (
          <button className="btn btn--danger" onClick={() => onDelete(product.id)}>
            Удалить
          </button>
        )}
      </div>
    </div>
  );
}