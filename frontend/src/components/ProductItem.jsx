import React from "react";
import { useShop } from '../context/ShopContex';
import { Link } from "react-router";

const ProductItem = ({ product }) => {
    const { currency } = useShop();
    
    const hasDiscount = product.discount > 0;
    const discountedPrice = hasDiscount 
        ? (product.price * (100 - product.discount)) / 100
        : product.price;

    return (
        <Link className="text-gray-700 cursor-pointer" to={`/product/${product._id}`}>
            <div className="overflow-hidden">
                <img className="hover:scale-110 transition ease-in-out" src={product.image[0].url} alt={product.name} />
                <p className="text-sm pt-3 pb-1">{product.name}</p>
                {hasDiscount ? (
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-red-600">{currency}{discountedPrice.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 line-through">{currency}{product.price.toLocaleString()}</p>
                    </div>
                ) : (
                    <p className="text-sm font-medium">{currency}{product.price.toLocaleString()}</p>
                )}
            </div>
        </Link>
    )
};

export default ProductItem;