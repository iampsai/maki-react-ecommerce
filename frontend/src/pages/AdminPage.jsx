import {useEffect, useState} from "react";
import {BarChart, PlusCircle, ShoppingBasket, ShoppingCart} from "lucide-react";
import {motion} from "framer-motion";

import {useProductStore} from "../stores/useProductStore.js";

import CreateProductForm from "../components/CreateProductForm.jsx";
import ProductsList from "../components/ProductsList.jsx";
import AnalyticsTab from "../components/AnalyticsTab.jsx";
import OrdersTab from "../components/OrdersTab.jsx";

const tabs = [
  {id: "create", label: "Create Product", icon: PlusCircle},
  {id: "products", label: "Products", icon: ShoppingBasket},
  {id: "orders", label: "Orders", icon: ShoppingCart},
  {id: "analytics", label: "Analytics", icon: BarChart},
];

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState("create");
  const {fetchAllProducts} = useProductStore();

  useEffect(() => {
    fetchAllProducts();
  }, [fetchAllProducts]);

  return (
    <div className='min-h-screen relative overflow-hidden'>
      <div className='relative z-10 container mx-auto px-4 py-16'>
        <motion.h1
          className='text-4xl font-bold mb-8 text-white text-center'
          initial={{opacity: 0, y: -20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8}}
        >
          Admin Dashboard
        </motion.h1>

        <div className='flex justify-center mb-8'>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center px-4 py-2 mx-2 rounded-md transition-colors duration-200 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              <tab.icon className='mr-2 h-5 w-5'/>
              {tab.label}
            </button>
          ))}
        </div>
        {activeTab === "create" && <CreateProductForm/>}
        {activeTab === "products" && <ProductsList/>}
        {activeTab === "orders" && <OrdersTab />}
        {activeTab === "analytics" && <AnalyticsTab />}
      </div>
    </div>
  )
}
export default AdminPage
