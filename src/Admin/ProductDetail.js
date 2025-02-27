import React from 'react';
import { useParams } from 'react-router-dom';

function ProductDetail() {
  const { id } = useParams(); // Lấy productId từ URL

  return (
    <div className="product-detail-container">
      <h1>Product Detail</h1>
      <p>Showing details for product ID: <strong>{id}</strong></p>
      {/* Nội dung chi tiết sản phẩm sẽ được thêm sau */}
    </div>
  );
}

export default ProductDetail;