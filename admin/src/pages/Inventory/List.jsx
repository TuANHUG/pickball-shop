import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";

const Inventory = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Filters
    const [filterType, setFilterType] = useState("all");
    const [filterCreatedBy, setFilterCreatedBy] = useState("");
    const [filterStartDate, setFilterStartDate] = useState("");
    const [filterEndDate, setFilterEndDate] = useState("");

    const limit = 10;
    const navigate = useNavigate();

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page,
                limit,
                type: filterType,
                created_by: filterCreatedBy,
                startDate: filterStartDate,
                endDate: filterEndDate
            });

            const response = await axios.get(
                `${import.meta.env.VITE_BACKEND_URL}/api/inventory-log/list?${params.toString()}`,
                { withCredentials: true }
            );
            if (response.data.success) {
                setLogs(response.data.logs);
                setTotalPages(response.data.totalPages);
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error(error.message);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchLogs();
    }, [page, filterType, filterStartDate, filterEndDate]); // Auto fetch on these changes

    // Debounce for text search
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchLogs();
        }, 500);
        return () => clearTimeout(delayDebounceFn);
    }, [filterCreatedBy]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Lịch sử nhập/xuất kho</h1>
                <button
                    onClick={() => navigate("/inventory/create")}
                    className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800"
                >
                    + Xuất/Nhập kho
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded shadow mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại phiếu</label>
                    <select
                        value={filterType}
                        onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                        <option value="all">Tất cả</option>
                        <option value="IMPORT">Nhập kho</option>
                        <option value="EXPORT">Xuất kho</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Người thực hiện</label>
                    <input
                        type="text"
                        value={filterCreatedBy}
                        onChange={(e) => { setFilterCreatedBy(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        placeholder="Tìm theo tên..."
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                    <input
                        type="date"
                        value={filterStartDate}
                        onChange={(e) => { setFilterStartDate(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                    <input
                        type="date"
                        value={filterEndDate}
                        onChange={(e) => { setFilterEndDate(e.target.value); setPage(1); }}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                </div>
            </div>

            {loading ? (
                <p>Loading...</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full bg-white border border-gray-200">
                        <thead>
                            <tr className="bg-gray-100 border-b">
                                <th className="py-2 px-4 text-left">Loại</th>
                                <th className="py-2 px-4 text-left">Sản phẩm</th>
                                <th className="py-2 px-4 text-left">Người thực hiện</th>
                                <th className="py-2 px-4 text-left">Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log) => (
                                <tr key={log._id} className="border-b hover:bg-gray-50">
                                    <td className="py-2 px-4">
                                        <span
                                            className={`px-2 py-1 rounded text-xs font-semibold ${log.type === "IMPORT"
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                                }`}
                                        >
                                            {log.type === "IMPORT" ? "Nhập kho" : "Xuất kho"}
                                        </span>
                                    </td>
                                    <td className="py-2 px-4">
                                        <ul className="list-disc list-inside">
                                            {log.items.map((item, index) => (
                                                <li key={index}>
                                                    {item.product_id?.name || "Unknown Product"} - SL:{" "}
                                                    {item.quantity}
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="py-2 px-4">{log.created_by}</td>
                                    <td className="py-2 px-4">
                                        {new Date(log.created_at).toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Pagination */}
            <div className="flex justify-center mt-4 gap-2">
                <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Prev
                </button>
                <span className="px-3 py-1 border rounded bg-gray-100">
                    Page {page} of {totalPages}
                </span>
                <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={page === totalPages}
                    className="px-3 py-1 border rounded disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Inventory;
