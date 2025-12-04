import { useState, useMemo, useCallback, useEffect } from "react";
import { toast } from "react-toastify";
import { ShopContext } from "./ShopContex";
import { backendUrl, currency, deliveryFee } from "../config/shopConfig";
import { useNavigate } from "react-router";
import axios from 'axios';
import { useAuth } from "./AuthContext";

const ShopProvider = ({ children }) => {
    const [search, setSearch] = useState('');
    const [showSearch, setShowSearch] = useState(false);
    const [cartItems, setCartItems] = useState([]);
    const [products, setProducts] = useState([]);
    const [tagGroups, setTagGroups] = useState([]);
    const limit = 10;
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const navigate = useNavigate();
    const { user } = useAuth();

    // Clear cart when user logs out
    useEffect(() => {
        if (!user) {
            setCartItems([]);
        }
    }, [user]);

    // Fetch Products
    const fetchProducts = useCallback(async () => {
        if (!hasMore) return;
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/product/list`, {
                params: {
                    lastId: nextCursor,
                    limit
                }
            });
            if (res.data.success) {
                setProducts(prev => [...prev, ...res.data.products]);
                setNextCursor(res.data.nextCursor);
                setHasMore(res.data.hasMore);
            } else {
                toast.error(res.data.message);
            }

        } catch (error) {
            console.error(error);
            toast.error("Failed to fetch products");
        }
    }, [nextCursor, hasMore]);

    // Get user cart data from DB
    const userCartData = useCallback(async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/cart/get`, { withCredentials: true });
            setCartItems(Array.isArray(res.data.cartData) ? res.data.cartData : []);
        } catch (error) {
            console.error(error);
            toast.error(error?.response?.data?.message || error.message);
        }
    }, []);

    // Fetch Tag Groups
    const fetchTagGroups = useCallback(async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/tag/tag-by-group`);
            if (res.data.success) {
                setTagGroups(res.data.data);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Đã có lỗi khi tải tags");
        }
    }, []);


    useEffect(() => {
        fetchProducts();
        fetchTagGroups();
        if (user) {
            userCartData();
        }
    }, [fetchProducts, fetchTagGroups, user, userCartData]);

    const addToCart = useCallback(async (itemId, size = '', color = '') => {
        setCartItems(prev => {
            const updated = [...prev];
            const existingIndex = updated.findIndex(
                item => item.productId === itemId && item.size === size && item.color === color
            );

            if (existingIndex > -1) {
                updated[existingIndex].quantity += 1;
            } else {
                updated.push({
                    productId: itemId,
                    size,
                    color,
                    quantity: 1
                });
            }
            return updated;
        });
        if (user) {
            try {
                const res = await axios.post(
                    `${backendUrl}/api/cart/add`,
                    { itemId, size, color },
                    { withCredentials: true }
                );
                if (res.data.success) {
                    toast.success(res.data.message);
                }
            } catch (error) {
                console.error(error);
                toast.error(error?.response?.data?.message || error.message);
            }
        }
    }, [user]);



    const getCartCount = useCallback(() => {
        if (!Array.isArray(cartItems)) return 0;
        return cartItems.reduce((total, item) => total + item.quantity, 0);
    }, [cartItems]);

    const updateQuantity = useCallback(async (itemId, size, color, quantity) => {
        setCartItems(prev => {
            const updated = [...prev];
            const existingIndex = updated.findIndex(
                item => item.productId === itemId && item.size === size && item.color === color
            );

            if (quantity === 0) {
                if (existingIndex > -1) {
                    updated.splice(existingIndex, 1);
                }
            } else {
                if (existingIndex > -1) {
                    updated[existingIndex].quantity = quantity;
                } else {
                    updated.push({
                        productId: itemId,
                        size,
                        color,
                        quantity
                    });
                }
            }
            return updated;
        });
        if (user) {
            try {
                await axios.put(
                    `${backendUrl}/api/cart/update`,
                    { itemId, size, color, quantity },
                    { withCredentials: true }
                );
            } catch (error) {
                console.error(error);
                toast.error(error?.response?.data?.message || error.message);
            }
        }
    }, [user]);

    const getCartAmount = useCallback(() => {
        let totalAmount = 0;
        for (const item of cartItems) {
            const product = products.find(p => p._id === item.productId);
            if (product && item.quantity) {
                totalAmount += product.price * item.quantity;
            }
        }
        return totalAmount;
    }, [cartItems, products]);

    const contextValue = useMemo(() => ({
        products,
        tagGroups,
        currency,
        deliveryFee,
        search,
        setSearch,
        showSearch,
        setShowSearch,
        cartItems,
        addToCart,
        getCartCount,
        updateQuantity,
        getCartAmount,
        navigate,
        backendUrl,
        setCartItems
    }), [search, showSearch, cartItems, addToCart, getCartCount, updateQuantity, getCartAmount, navigate, products, tagGroups]);

    return (
        <ShopContext.Provider value={contextValue}>
            {children}
        </ShopContext.Provider>
    );
};

export default ShopProvider;
