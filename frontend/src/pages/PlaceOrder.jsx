import React, { useState } from 'react';
import Title from '../components/Title';
import CartTotal from '../components/CartTotal';
import { assets } from '../assets/frontend_assets/assets';
import { toast } from 'react-toastify';
import { useShop } from '../context/ShopContex';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function PlaceOrder() {
    const {user} = useAuth();    
    const [loading, setLoading] = useState(false);
    const {
        products,
        deliveryFee,
        cartItems,
        getCartAmount,
        navigate,
        backendUrl,
        setCartItems
    } = useShop();

    const [formData, setFormData] = useState({
        name: "",
        address: "",
        ward: "",
        city: "",
        phone: ""
    });

    const onChangeHandler = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            let orderItems = [];

            for (const item of cartItems) {
                const product = products.find(p => p._id === item.productId);
                if (product && item.quantity > 0) {
                    orderItems.push({
                        productId: product._id,
                        name: product.name,
                        size: item.size,
                        color: item.color,
                        quantity: item.quantity,
                        price: product.price
                    });
                }
            }

            const orderPayload = {
                name: formData.name,
                phone: formData.phone,
                items: orderItems,
                amount: getCartAmount() + deliveryFee,
                address: {
                    street: formData.address,
                    ward: formData.ward,
                    city: formData.city
                }
            };

            const res = await axios.post(`${backendUrl}/api/order/place-cod`, orderPayload, {
                withCredentials: true
            });

            if (res.data.success) {
                setCartItems([]);
                navigate("/orders");
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message || "Đặt hàng thất bại");
            }
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || error.message || "Đã có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form
            onSubmit={onSubmitHandler}
            className='flex flex-col sm:flex-row justify-between gap-4 pt-5 sm:pt-14 min-h-[80vh] border-t-2 border-gray-300'
        >
            {/* Left Side */}
            <div className='flex flex-col gap-4 w-full sm:max-w-[480px]'>
                <div className='text-xl sm:text-2xl py-3'>
                    <Title text1='THÔNG TIN' text2='GIAO HÀNG' />
                </div>
                <input required name='name' value={formData.name} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Tên người nhận' type="text" />
                <input name='email' value={user?.email || ""} readOnly className='border border-gray-300 rounded py-1.5 px-3.5 w-full bg-gray-100' placeholder='Địa chỉ email' type="email" />
                <input required name='address' value={formData.address} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Địa chỉ' type="text" />
                <div className='flex gap-3'>
                    <input required name='ward' value={formData.ward} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Phường/Xã' type="text" />
                    <input required name='city' value={formData.city} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Thành phố' type="text" />
                </div>
                <input required name='phone' value={formData.phone} onChange={onChangeHandler} className='border border-gray-300 rounded py-1.5 px-3.5 w-full' placeholder='Số điện thoại' type="number" />
            </div>

            {/* Right Side */}
            <div className='mt-8'>
                <div className='mt-8 min-w-80'>
                    <CartTotal />
                </div>

                <div className='mt-12'>

                    <div className='w-full text-end mt-8'>
                        <button
                            type='submit'
                            disabled={loading}
                            className='bg-black text-white px-16 py-3 text-sm cursor-pointer disabled:opacity-50'
                        >
                            {loading ? "Đang đặt hàng..." : "ĐẶT HÀNG"}
                        </button>
                    </div>
                </div>
            </div>
        </form>
    );
}

export default PlaceOrder;
