import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import { Users, Package, ShoppingCart, DollarSign, PhilippinePeso } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const AnalyticsTab = () => {
  const [analyticsData, setAnalyticsData] = useState({
    users: 0,
    products: 0,
    sales: 0,
    revenue: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [dailySalesData, setDailySalesData] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get("/analytics");
        console.log("Analytics data:", response.data);
        
        if (response.data && response.data.analyticsData) {
          setAnalyticsData(response.data.analyticsData);
        }
        
        if (response.data && response.data.dailySalesData && Array.isArray(response.data.dailySalesData)) {
          setDailySalesData(response.data.dailySalesData);
        } else {
          console.warn("Daily sales data is not in expected format:", response.data.dailySalesData);
          setDailySalesData([]);
        }
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        setError("Failed to load analytics data. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
    </div>;
  }
  
  if (error) {
    return <div className="flex justify-center items-center h-64 text-red-500">{error}</div>;
  }

  return (
    <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
        <AnalyticsCard
          title='Total Users'
          value={analyticsData.users.toLocaleString()}
          icon={Users}
          color='from-emerald-500 to-teal-700'
        />
        <AnalyticsCard
          title='Total Products'
          value={analyticsData.products.toLocaleString()}
          icon={Package}
          color='from-emerald-500 to-green-700'
        />
        <AnalyticsCard
          title='Total Sales'
          value={analyticsData.sales.toLocaleString()}
          icon={ShoppingCart}
          color='from-emerald-500 to-cyan-700'
        />
        <AnalyticsCard
          title='Total Revenue'
          value={`₱${analyticsData.revenue.toLocaleString()}`}
          icon={PhilippinePeso}
          color='from-emerald-500 to-lime-700'
        />
      </div>
      <motion.div
        className='bg-gray-800/60 rounded-lg p-6 shadow-lg'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.25 }}
      >
        <h2 className="text-xl font-semibold text-white mb-4">Sales & Revenue (Last 7 Days)</h2>
        {dailySalesData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <p>No sales data available for the selected period</p>
          </div>
        ) : (
          <ResponsiveContainer width='100%' height={400}>
            <LineChart data={dailySalesData}>
              <CartesianGrid strokeDasharray='3 3' stroke="#374151" />
              <XAxis dataKey='name' stroke='#D1D5DB' />
              <YAxis yAxisId='left' stroke='#D1D5DB' />
              <YAxis yAxisId='right' orientation='right' stroke='#D1D5DB' />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '0.5rem' }}
                itemStyle={{ color: '#fff' }}
                labelStyle={{ color: '#D1D5DB' }}
              />
              <Legend />
              <Line
                yAxisId='left'
                type='monotone'
                dataKey='sales'
                stroke='#10B981'
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name='Orders'
              />
              <Line
                yAxisId='right'
                type='monotone'
                dataKey='revenue'
                stroke='#3B82F6'
                strokeWidth={2}
                activeDot={{ r: 8 }}
                name='Revenue (₱)'
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </motion.div>
    </div>
  );
};
export default AnalyticsTab;

const AnalyticsCard = ({ title, value, icon: Icon, color }) => (
  <motion.div
    className={`bg-gray-800 rounded-lg p-6 shadow-lg overflow-hidden relative ${color}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
  >
    <div className='flex justify-between items-center'>
      <div className='z-10'>
        <p className='text-emerald-300 text-sm mb-1 font-semibold'>{title}</p>
        <h3 className='text-white text-3xl font-bold'>{value}</h3>
      </div>
    </div>
    <div className='absolute inset-0 bg-gradient-to-br from-emerald-600 to-emerald-900 opacity-30' />
    <div className='absolute -bottom-4 -right-4 text-emerald-800 opacity-50'>
      <Icon className='h-32 w-32' />
    </div>
  </motion.div>
);