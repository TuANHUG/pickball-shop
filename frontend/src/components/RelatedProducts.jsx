import React, { useEffect, useState } from "react";
import { useShop } from '../context/ShopContex';
import Title from "./Title";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ tags, currentProductId }) => {
  const { products } = useShop();
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length && tags && tags.length > 0) {
      // Lấy danh sách ID của tags
      const tagIds = tags.map(tag => tag._id || tag);
      
      // Lọc sản phẩm có chung ít nhất 1 tag và không phải sản phẩm hiện tại
      const filtered = products.filter(item => {
        if (item._id === currentProductId) return false;
        if (!item.tags || item.tags.length === 0) return false;
        
        const productTagIds = item.tags.map(tag => tag._id || tag);
        return productTagIds.some(tagId => tagIds.includes(tagId));
      });
      
      setRelated(filtered.slice(0, 5));
    }
  }, [products, tags, currentProductId]);

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1="RELATED" text2="PRODUCTS" />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map(item => (
          <ProductItem
            key={item._id}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
