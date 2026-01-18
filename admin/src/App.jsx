import { Route, Routes } from "react-router";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Add from "./pages/Product/Add";
import List from "./pages/Product/List";
import Edit from "./pages/Product/Edit";
import Review from "./pages/Product/Review";
import Tag from "./pages/Tag/Tag";
import Orders from "./pages/Order/Orders";
import InventoryList from "./pages/Inventory/List";
import CreateInventoryLog from "./pages/Inventory/Create";
import Dashboard from "./pages/Dashboard";
import User from "./pages/User/User";
import { ToastContainer } from 'react-toastify';
import Login from "./components/Login";

const App = () => {
  const { loading, user } = useAuth();
  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="bg-gray-50 min-h-screen">
      <ToastContainer />
      {
        !user ?
          (<Login />)
          :
          (
            <>
              <Navbar />
              <hr className="border border-gray-300" />
              <div className="flex w-full">
                <Sidebar />
                <div className="w-[70%] mx-auto ml-[max(5vw,25px)] my-8 text-gray-600 text-base">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/manage-product" element={<List />} />
                    <Route path="/manage-product/add" element={<Add />} />
                    <Route path="/manage-product/edit/:id" element={<Edit />} />
                    <Route path="/review/:productId" element={<Review />} />
                    <Route path="/orders" element={<Orders />} />
                    <Route path="/tag" element={<Tag />} />
                    <Route path="/users" element={<User />} />
                    <Route path="/inventory" element={<InventoryList />} />
                    <Route path="/inventory/create" element={<CreateInventoryLog />} />
                  </Routes>
                </div>
              </div>
            </>
          )
      }
    </div>
  );
};

export default App;
