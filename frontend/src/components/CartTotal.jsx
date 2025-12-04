import React from "react";
import { useShop } from "../context/ShopContex";
import Title from "./Title";

const CartTotal = () => {
    const { currency, deliveryFee, getCartAmount } = useShop();
    const subtotal = getCartAmount();
    const total = subtotal === 0 ? 0 : subtotal + deliveryFee;

    return (
        <div className="w-full">
            <div className="text-2xl">
                <Title text1="TỔNG" text2="GIỎ HÀNG" />
            </div>
            <div className="flex flex-col gap-2 mt-2 text-sm">
                <div className="flex justify-between">
                    <p>Tạm tính</p>
                    <p>{currency}{subtotal.toFixed(2)}</p>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between">
                    <p>Phí vận chuyển</p>
                    <p>{currency}{deliveryFee.toFixed(2)}</p>
                </div>
                <hr className="border-gray-300" />
                <div className="flex justify-between">
                    <b>Tổng cộng</b>
                    <b>{currency}{total.toFixed(2)}</b>
                </div>
            </div>
        </div>
    );
};

export default CartTotal;