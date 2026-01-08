import React from "react";
import { NavLink } from "react-router";
import { assets } from "../assets/admin_assets/assets";

const Sidebar = () => {
    return (
        <div className="w-[18%] min-h-screen border-r-2 border-gray-300">
            <div className="flex flex-col gap-4 pt-6 pl-[20%] text-[15px]">

                {/* Dashboard */}
                <NavLink to="/dashboard">
                    {({ isActive }) => (
                        <div className={`flex items-center gap-3 border border-r-0 px-3 py-2 rounded-l 
                            ${isActive ? "bg-[#ffebf5] border-[#c586a5]" : "border-gray-300"}`}>
                            <img className="w-5 h-5" src={assets.order_icon} alt="Dashboard" />
                            <p className="hidden md:block">Dashboard</p>
                        </div>
                    )}
                </NavLink>

                {/* List Items */}
                <NavLink to="/manage-product">
                    {({ isActive }) => (
                        <div className={`flex items-center gap-3 border border-r-0 px-3 py-2 rounded-l 
                            ${isActive ? "bg-[#ffebf5] border-[#c586a5]" : "border-gray-300"}`}>
                            <img className="w-5 h-5" src={assets.order_icon} alt="List Items" />
                            <p className="hidden md:block">Quản lý sản phẩm</p>
                        </div>
                    )}
                </NavLink>
                {/* List Tags */}
                <NavLink to="/tag">
                    {({ isActive }) => (
                        <div className={`flex items-center gap-3 border border-r-0 px-3 py-2 rounded-l 
                            ${isActive ? "bg-[#ffebf5] border-[#c586a5]" : "border-gray-300"}`}>
                            <img className="w-5 h-5" src={assets.order_icon} alt="List Items" />
                            <p className="hidden md:block">Quản lý tags</p>
                        </div>
                    )}
                </NavLink>

                {/* Orders */}
                <NavLink to="/orders">
                    {({ isActive }) => (
                        <div className={`flex items-center gap-3 border border-r-0 px-3 py-2 rounded-l 
                            ${isActive ? "bg-[#ffebf5] border-[#c586a5]" : "border-gray-300"}`}>
                            <img className="w-5 h-5" src={assets.order_icon} alt="Orders" />
                            <p className="hidden md:block">Quản lý đơn hàng</p>
                        </div>
                    )}
                </NavLink>

                {/* Inventory */}
                <NavLink to="/inventory">
                    {({ isActive }) => (
                        <div className={`flex items-center gap-3 border border-r-0 px-3 py-2 rounded-l 
                            ${isActive ? "bg-[#ffebf5] border-[#c586a5]" : "border-gray-300"}`}>
                            <img className="w-5 h-5" src={assets.order_icon} alt="Inventory" />
                            <p className="hidden md:block">Quản lý kho</p>
                        </div>
                    )}
                </NavLink>
                
                {/* Users */}
                <NavLink to="/users">
                    {({ isActive }) => (
                        <div className={`flex items-center gap-3 border border-r-0 px-3 py-2 rounded-l 
                            ${isActive ? "bg-[#ffebf5] border-[#c586a5]" : "border-gray-300"}`}>
                            <img className="w-5 h-5" src={assets.order_icon} alt="Users" />
                            <p className="hidden md:block">Quản lý người dùng</p>
                        </div>
                    )}
                </NavLink>

            </div>
        </div>
    )
};

export default Sidebar;