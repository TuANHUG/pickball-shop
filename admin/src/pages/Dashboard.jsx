import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const Dashboard = () => {
    const [stats, setStats] = useState([]);
    const [productStats, setProductStats] = useState([]);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [productSort, setProductSort] = useState('desc');
    const [summary, setSummary] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalProducts: 0
    });
    const currency = "$"; // Default currency

    const setDateRange = (days) => {
        const today = new Date();
        const pastDate = new Date(today);
        pastDate.setDate(today.getDate() - (days - 1));

        const offset = today.getTimezoneOffset();
        const pastDateLocal = new Date(pastDate.getTime() - (offset * 60 * 1000));
        const todayLocal = new Date(today.getTime() - (offset * 60 * 1000));

        setStartDate(pastDateLocal.toISOString().split('T')[0]);
        setEndDate(todayLocal.toISOString().split('T')[0]);
    };

    useEffect(() => {
        setDateRange(7);
    }, []);

    const fetchStats = async () => {
        if (!startDate || !endDate) return;
        try {
            const response = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/dashboard/stats`, {
                params: { startDate, endDate, productSort },
                withCredentials: true
            });
            if (response.data.success) {
                setStats(response.data.data);
                setProductStats(response.data.productStats || []);

                // Calculate summary
                // Calculate summary
                const totalSales = response.data.data.reduce((acc, curr) => acc + curr.totalSales, 0);
                const totalOrders = response.data.data.reduce((acc, curr) => acc + curr.totalOrders, 0);
                const totalProducts = response.data.data.reduce((acc, curr) => acc + curr.totalProducts, 0);

                setSummary({ totalSales, totalOrders, totalProducts });
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
    };

    useEffect(() => {
        if (startDate && endDate) {
            fetchStats();
        }
    }, [startDate, endDate, productSort]);

    return (
        <div className='w-full p-4'>
            <h3 className='text-2xl font-bold mb-4'>Dashboard</h3>

            {/* Date Filter */}
            <div className='flex flex-col xl:flex-row gap-4 mb-8 items-start xl:items-end bg-white p-4 rounded shadow-sm'>
                <div className='flex gap-2'>
                    <button onClick={() => setDateRange(7)} className='px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors'>7 Days</button>
                    <button onClick={() => setDateRange(30)} className='px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors'>30 Days</button>
                    <button onClick={() => setDateRange(90)} className='px-3 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded border border-gray-300 transition-colors'>3 Months</button>
                </div>
                <div className='flex gap-4 items-end flex-wrap'>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>Start Date</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                        />
                    </div>
                    <div>
                        <label className='block text-sm font-medium text-gray-700'>End Date</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className='mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2'
                        />
                    </div>
                    <button
                        onClick={fetchStats}
                        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
                    >
                        Filter
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
                <div className='bg-white p-6 rounded-lg shadow-md border border-gray-200'>
                    <h4 className='text-gray-500 text-sm font-medium'>Total Sales</h4>
                    <p className='text-2xl font-bold text-gray-900'>{currency}{summary.totalSales.toLocaleString()}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-md border border-gray-200'>
                    <h4 className='text-gray-500 text-sm font-medium'>Total Orders</h4>
                    <p className='text-2xl font-bold text-gray-900'>{summary.totalOrders}</p>
                </div>
                <div className='bg-white p-6 rounded-lg shadow-md border border-gray-200'>
                    <h4 className='text-gray-500 text-sm font-medium'>Total Products Sold</h4>
                    <p className='text-2xl font-bold text-gray-900'>{summary.totalProducts}</p>
                </div>
            </div>
            {/* Charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                <div className='bg-white p-4 rounded-lg shadow-md border border-gray-200'>
                    <h4 className='text-lg font-semibold mb-4'>Sales Overview</h4>
                    <div className='h-80'>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats}>
                                <XAxis dataKey="date" />
                                <YAxis />
                                <Tooltip formatter={(value) => `${currency}${value.toLocaleString()}`} />
                                <Legend />
                                <Bar dataKey="totalSales" fill="#8884d8" name="Sales" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className='bg-white p-4 rounded-lg shadow-md border border-gray-200'>
                    <h4 className='text-lg font-semibold mb-4'>Orders & Products</h4>
                    <div className='h-80'>
                        <div className='h-80'>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={stats}>
                                    <XAxis dataKey="date" />
                                    <YAxis yAxisId="left" allowDecimals={false} />
                                    <YAxis yAxisId="right" orientation="right" allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Line yAxisId="left" type="monotone" dataKey="totalOrders" stroke="#82ca9d" name="Orders" />
                                    <Line yAxisId="right" type="monotone" dataKey="totalProducts" stroke="#ff7300" name="Products" />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Product Statistics Chart */}
            <div className='bg-white p-4 rounded-lg shadow-md border border-gray-200'>
                <div className='flex justify-between items-center mb-4'>
                    <h4 className='text-lg font-semibold'>Product Statistics</h4>
                    <select
                        value={productSort}
                        onChange={(e) => setProductSort(e.target.value)}
                        className='border border-gray-300 rounded-md shadow-sm p-1 text-sm'
                    >
                        <option value="desc">Best Selling</option>
                        <option value="asc">Least Selling</option>
                    </select>
                </div>
                <div className='h-96'>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            layout="vertical"
                            data={productStats}
                            margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                        >
                            <XAxis type="number" allowDecimals={false} />
                            <YAxis dataKey="name" type="category" width={150} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="quantity" fill="#82ca9d" name="Quantity Sold" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>);
};
export default Dashboard;
