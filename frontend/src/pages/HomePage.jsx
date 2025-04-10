import { useEffect } from 'react'

import CategoryItem from '../components/CategoryItem'
import FeaturedProducts from "../components/FeaturedProducts.jsx";

import {useProductStore} from "../stores/useProductStore.js";

const HomePage = () => {
  const categories = [
    { href: "/handlebars", name: "Handlebars", imageUrl: "/bike_handlebar.jpg" },
    { href: "/forks", name: "Forks", imageUrl: "/bike_fork.jpg" },
    { href: "/shifters", name: "Shifters", imageUrl: "/bike_shifters.jpg" },
    { href: "/brakes", name: "Brakes", imageUrl: "/bike_brakes.jpg" },
    { href: "/pedals", name: "Pedals", imageUrl: "/bike_pedal.jpg" },
    { href: "/saddles", name: "Saddle", imageUrl: "/bike_saddle.jpg" },
    { href: "/wheels", name: "Wheels", imageUrl: "/bike_wheel.jpg" },
  ];

  const { fetchFeaturedProducts, products, isLoading } = useProductStore();

  useEffect(() => {
    fetchFeaturedProducts();
  }, [fetchFeaturedProducts]);

  return (
    <div className='relative min-h-screen text-white overflow-hidden'>
      <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
        <h1 className='text-center text-5xl sm:text-6xl font-bold text-white mb-4'>
          Explore Our Categories
        </h1>
        <p className='text-center text-xl text-gray-200 mb-12'>
          Discover the latest products
        </p>

        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {categories.map((category) => (
            <CategoryItem category={category} key={category.name} />
          ))}
        </div>

        {!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
      </div>
    </div>
  )
}
export default HomePage
