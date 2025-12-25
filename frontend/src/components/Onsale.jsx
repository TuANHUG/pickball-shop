import React, { useEffect, useState } from "react";
import Title from "./Title";
import { useShop } from '../context/ShopContex';
import ProductItem from "./ProductItem";

const Onsale = () => {
    const { products } = useShop();
    const [onSaleProducts, setOnSaleProducts] = useState([]);

    useEffect(() => {
        const saleProducts = products.filter(item => item.discount > 0);
        const sortedSaleProducts = saleProducts.sort((a, b) => b.discount - a.discount);
        setOnSaleProducts(sortedSaleProducts);
    }, [products])

    return (
        <div className="my-10">
            <div className="text-center text-3xl py-8">
                <Title text1="ON" text2="SALE"></Title>
                <p className="w-3/4 m-auto text-xs sm:text-sm md:text-base text-gray-600">
                    Grab the best deals on our top-quality products. Limited time offers!
                </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
                {
                    onSaleProducts.map((item, index) => (
                        <ProductItem key={index} product={item} />
                    ))
                }
            </div>
        </div>
    );
};

export default Onsale;
