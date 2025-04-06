import {useEffect, useState} from "react";
import axios from "../lib/axios.js";
import {toast} from "react-hot-toast";

import ProductCard from "./ProductCard.jsx";
import LoadingSpinner from "./LoadingSpinner.jsx";

const PeopleAlsoBought = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await axios.get("/products/recommendations");
        setRecommendations(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "An error occurred while fetching recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  if(loading) return <LoadingSpinner />

  return (
    <div className='mt-8'>
      <h3 className='text-2xl font-semibold text-white'>People also bought</h3>
      <div className='mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg: grid-col-3'>
        {recommendations.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))}
      </div>
    </div>
  )
}
export default PeopleAlsoBought
