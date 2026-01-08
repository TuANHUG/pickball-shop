import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaTrash, FaCheck, FaTimes, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { useNavigate } from 'react-router';

const User = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [limit] = useState(10);

  const backendUrl = import.meta.env.VITE_BACKEND_URL;
  const currency = "$";

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get(backendUrl + '/api/user/all-users', {
        params: { page, limit, search, sortBy, sortOrder },
        withCredentials: true
      });
      if (response.data.success) {
        setUsers(response.data.users);
        setTotalPages(response.data.totalPages);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error("Lỗi tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search, sortBy, sortOrder]);

  const handleSearch = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleDeleteUser = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        const response = await axios.post(backendUrl + '/api/user/delete-user', { id }, { withCredentials: true });
        if (response.data.success) {
          toast.success(response.data.message);
          fetchUsers();
        } else {
          toast.error(response.data.message);
        }
      } catch (error) {
        toast.error("Lỗi xóa người dùng");
      }
    }
  };

  const handleToggleStatus = async (userId, field, currentValue) => {
    if (!window.confirm(`Bạn có chắc chắn muốn thay đổi trạng thái ${field === 'canComment' ? 'đánh giá' : 'nhắn tin'} của người dùng này?`)) {
      return;
    }
    try {
      const response = await axios.post(backendUrl + '/api/user/update-user-status', 
        { userId, [field]: !currentValue }, 
        { withCredentials: true }
      );
      if (response.data.success) {
        toast.success("Cập nhật thành công");
        setUsers(users.map(u => u._id === userId ? { ...u, [field]: !currentValue } : u));
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error("Lỗi cập nhật trạng thái");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <FaSort className="text-gray-400" />;
    return sortOrder === 'asc' ? <FaSortUp className="text-black" /> : <FaSortDown className="text-black" />;
  };

  return (
    <div>
        <h3 className="text-2xl font-bold mb-4">Quản lý người dùng</h3>

    <div className='p-4 bg-white rounded-lg shadow-md'>
      
      {/* Search Bar */}
      <div className="mb-4">
        <input 
          type="text" 
          placeholder="Tìm kiếm theo Tên, Email " 
          value={search} 
          onChange={handleSearch} 
          className="border p-2 rounded w-full md:w-1/3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr className="bg-gray-100 text-left text-sm font-semibold text-gray-700 tracking-wider">
              <th className="py-3 px-4 border-b cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Tên <SortIcon field="name" /></div>
              </th>
              <th className="py-3 px-4 border-b cursor-pointer" onClick={() => handleSort('email')}>
                <div className="flex items-center gap-1">Email <SortIcon field="email" /></div>
              </th>
              <th className="py-3 px-4 border-b cursor-pointer text-center" onClick={() => handleSort('totalOrders')}>
                <div className="flex items-center justify-center gap-1">Đơn hàng <SortIcon field="totalOrders" /></div>
              </th>
              <th className="py-3 px-4 border-b cursor-pointer text-center" onClick={() => handleSort('totalProducts')}>
                <div className="flex items-center justify-center gap-1">Sản phẩm <SortIcon field="totalProducts" /></div>
              </th>
              <th className="py-3 px-4 border-b cursor-pointer text-center" onClick={() => handleSort('totalSpent')}>
                <div className="flex items-center justify-center gap-1">Tổng tiền <SortIcon field="totalSpent" /></div>
              </th>
              <th className="py-3 px-4 border-b text-center">Đánh giá</th>
              <th className="py-3 px-4 border-b text-center">Hành động</th>
            </tr>
          </thead>
          <tbody className='text-sm text-gray-600'>
            {loading ? (
              <tr><td colSpan="7" className="text-center py-4">Đang tải...</td></tr>
            ) : users.length === 0 ? (
               <tr><td colSpan="7" className="text-center py-4">Không tìm thấy người dùng</td></tr>
            ) : (
              users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 border-b">
                  <td className="py-3 px-4 font-medium">{user.name}</td>
                  <td className="py-3 px-4">{user.email}</td>
                  <td className="py-3 px-4 text-center">
                    <span 
                        onClick={() => navigate(`/orders?userId=${user._id}`)}
                        className="text-blue-600 hover:text-blue-800 cursor-pointer hover:underline font-semibold"
                        title="Xem chi tiết đơn hàng"
                    >
                        {user.totalOrders}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">{user.totalProducts}</td>
                  <td className="py-3 px-4 text-center font-semibold text-green-600">{currency}{user.totalSpent.toLocaleString()}</td>
                  <td className="py-3 px-4 text-center">
                    <button 
                      onClick={() => handleToggleStatus(user._id, 'canComment', user.canComment)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${user.canComment ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {user.canComment ? 'Cho phép' : 'Cấm'}
                    </button>
                    {/* Add Chat Toggle Here if needed */}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <button onClick={() => handleDeleteUser(user._id)} className="text-red-500 hover:text-red-700 p-2">
                       <FaTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-gray-500">Trang {page} / {totalPages}</span>
        <div className="flex gap-2">
          <button 
            disabled={page === 1} 
            onClick={() => setPage(page - 1)} 
            className={`px-4 py-2 border rounded ${page === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            Trước
          </button>
          <button 
            disabled={page === totalPages || totalPages === 0} 
            onClick={() => setPage(page + 1)} 
            className={`px-4 py-2 border rounded ${page === totalPages || totalPages === 0 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'hover:bg-gray-100'}`}
          >
            Sau
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default User;
