import {ShoppingCart} from "lucide-react";
import {toast} from "react-hot-toast";

import {useUserStore} from "../stores/useUserStore.js";
import {useCartStore} from "../stores/useCartStore.js";

const ProductCard = ({product}) => {
  const {user} = useUserStore();
  const {addToCart} = useCartStore();

  const handleAddToCart = () => {
    if (user) {
      addToCart(product);
    } else {
      toast.error("You must be logged in to add a product to your cart", {id: "addToCart"});
    }
  }

  return (
    <div className='flex w-full relative flex-col overflow-hidden rounded-lg border border-gray-700 shadow-lg bg-emerald-900'>
      <div className='relative mx-3 mt-3 flex h-60 overflow-hidden rounded-xl'>
        <img className='object-cover w-full' src={product.image} alt='product image' />
        <div className='absolute inset-0 bg-black opacity-10' />
      </div>

      <div className='mt-4 px-5 pb-5'>
        <h5 className='text-xl font-semibold tracking-tight text-white'>{product.name}</h5>
        <div className='mt-2 mb-5 flex items-center justify-between'>
          <p>
            <span className='text-3xl font-bold text-white'>₱{product.price}</span>
          </p>
        </div>
        <button
          className='flex items-center justify-center rounded-lg bg-emerald-600 px-5 py-2.5 text-center text-sm font-medium
					 text-white hover:bg-emerald-700 focus:outline-none focus:ring-4 focus:ring-emerald-300 cursor-pointer'
          onClick={handleAddToCart}
        >
          <ShoppingCart size={22} className='mr-2' />
          Add to cart
        </button>
      </div>
    </div>
  )
}
export default ProductCard
