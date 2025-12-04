import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useShop } from '../context/ShopContex';
import { assets } from '../assets/frontend_assets/assets';
import RelatedProducts from '../components/RelatedProducts';

function Product() {
    const { productId } = useParams();
    const { products, currency, addToCart, tagGroups } = useShop();

    const [productDetails, setProductDetails] = useState(null);
    const [image, setImage] = useState('');
    const [size, setSize] = useState('');
    const [color, setColor] = useState('');
    const [productSizes, setProductSizes] = useState([]);
    const [productColors, setProductColors] = useState([]);

    useEffect(() => {
        const product = products.find(item => item._id === productId);
        if (product) {
            setProductDetails(product);
            setImage(product.image?.[0]);

            // Get Size tag group
            const sizeTag = tagGroups.find(group => group.name === "Size");
            
            if (sizeTag && product.tags) {
                // Get size tag IDs from the Size group
                const sizeTagIds = sizeTag.tags.map(tag => tag._id || tag.id);
                
                // Find product tags that are in the Size group
                const productSizeTags = product.tags.filter(tag => 
                    sizeTagIds.includes(tag._id || tag.id || tag)
                );
                
                // Extract size names
                const sizes = productSizeTags.map(tag => tag.name).filter(Boolean);
                setProductSizes(sizes);
            } else {
                setProductSizes([]);
            }

            // Get Color tag group
            const colorTag = tagGroups.find(group => group.name === "Color");
            
            if (colorTag && product.tags) {
                // Get color tag IDs from the Color group
                const colorTagIds = colorTag.tags.map(tag => tag._id || tag.id);
                
                // Find product tags that are in the Color group
                const productColorTags = product.tags.filter(tag => 
                    colorTagIds.includes(tag._id || tag.id || tag)
                );
                
                // Extract color names
                const colors = productColorTags.map(tag => tag.name).filter(Boolean);
                setProductColors(colors);
            } else {
                setProductColors([]);
            }
        }
    }, [productId, products, tagGroups]);
    
    const handleAddToCart = () => {
        // Check if product has size tags and size is not selected
        if (productSizes.length > 0 && !size) {
            alert('Vui lòng chọn size');
            return;
        }
        
        // Check if product has color tags and color is not selected
        if (productColors.length > 0 && !color) {
            alert('Vui lòng chọn màu');
            return;
        }
        
        // Add to cart with appropriate parameters
        if (productSizes.length > 0 || productColors.length > 0) {
            addToCart(productDetails._id, size || '', color || '');
        } else {
            addToCart(productDetails._id);
        }
    };

    if (!productDetails) return <div>Loading...</div>;

    return (
        <div className='border-t-2 border-gray-300 pt-10 transition-opacity ease-in duration-500 opacity-100'>
            {/* Product Main Section */}
            <div className='flex gap-12 sm:gap-12 flex-col sm:flex-row'>
                {/* Product Images */}
                <div className='flex-1 flex flex-col-reverse gap-3 sm:flex-row'>
                    <div className='flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full'>
                        {productDetails.image.map((img) => (
                            <img
                                onClick={() => setImage(img)}
                                src={img.url}
                                key={img._id}
                                alt={img._id}
                                className='w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer'
                            />
                        ))}
                    </div>
                    <div className='w-full sm:w-[80%]'>
                        <img src={image.url} alt="Selected product" className='w-full h-auto' />
                    </div>
                </div>

                {/* Product Info */}
                <div className='flex-1'>
                    <h1 className='font-medium text-2xl mt-2'>{productDetails.name}</h1>
                    {/* <div className='flex gap-1 mt-2 items-center'>
                        {[...Array(5)].map((_, i) => (
                            <img
                                key={i}
                                src={i < 4 ? assets.star_icon : assets.star_dull_icon}
                                className="w-3.5"
                                alt={`Star ${i + 1}`}
                            />
                        ))}
                        <p className='pl-2'>(122)</p>
                    </div> */}
                    <p className='mt-5 text-3xl font-medium'>{currency}{productDetails.price}</p>
                    <p className='mt-5 text-gray-500 md:w-4/5'>{productDetails.description}</p>

                    {/* Color Selection - Only show if product has color tags */}
                    {productColors.length > 0 && (
                        <div className='flex flex-col gap-4 my-8'>
                            <p>Select Color</p>
                            <div className='flex gap-2'>
                                {productColors.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setColor(item)}
                                        className={`border py-2 px-4 bg-gray-100 cursor-pointer ${item === color ? 'border-orange-500' : 'border-gray-300'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Size Selection - Only show if product has size tags */}
                    {productSizes.length > 0 && (
                        <div className='flex flex-col gap-4 my-8'>
                            <p>Select Size</p>
                            <div className='flex gap-2'>
                                {productSizes.map((item, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSize(item)}
                                        className={`border py-2 px-4 bg-gray-100 cursor-pointer ${item === size ? 'border-orange-500' : 'border-gray-300'}`}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <button onClick={handleAddToCart} className='bg-black text-white px-8 py-3 text-sm active:bg-gray-700'>ADD TO CART</button>

                    <hr className='mt-8 sm:w-3/4 border-gray-300' />

                    <div className='text-sm text-gray-500 mt-5 flex flex-col gap-1'>
                        <p>100% Original product.</p>
                        <p>Cash on delivery is available on this product.</p>
                        <p>Easy return and exchange policy within 7 days.</p>
                    </div>
                </div>
            </div>

            {/* Description & Review Section */}
            <div className='mt-20'>
                <div className='flex'>
                    <b className='border border-gray-300 px-5 py-3 text-sm'>Description</b>
                </div>
                <div className='border border-gray-300 flex flex-col gap-4 p-6 text-sm text-gray-500'>
                    <p>{productDetails.description}</p>
                </div>
            </div>

            {/* Related Products */}
            <RelatedProducts tags={productDetails.tags} currentProductId={productDetails._id} />
        </div>
    );
}

export default Product;
