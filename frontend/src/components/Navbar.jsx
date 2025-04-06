import {ShoppingCart, UserPlus, LogIn, LogOut, Lock} from "lucide-react";
import {Link} from "react-router-dom";
import {useUserStore} from "../stores/useUserStore.js";
import {useCartStore} from "../stores/useCartStore.js";

const Navbar = () => {
  const {user, logout} = useUserStore();
  const isAdmin = user?.role === "admin";

  const {cart} = useCartStore();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className={"fixed top-0 left-0 right-0 z-50 bg-gray-900 bg-opacity-90 backdrop-blur-md shadow-lg transition-all" +
      " duration-300 border-b border-emerald-800 w-full"}>
      <div className={"container mx-auto px-4 py-3"}>
        <div className={"flex flex-wrap items-center justify-between"}>
          <Link to={"/"} className={"text-2xl font-bold text-emerald-400 items-center space-x-2 flex"}>
            E-Commerce
          </Link>

          <nav className={"flex flex-wrap items-center gap-4"}>
            <Link to={"/"} className={"text-gray-300 hover:text-emerald-400 transition duration-300 ease-in-out"}>Home</Link>

            {user && user?.role !== "admin" && (
              <Link to={"/cart"} className={"relative group text-gray-300 hover:text-emerald-400 transition duration-300" +
                " ease-in-out"}>
                <ShoppingCart className={"inline-block mr-1 group-hover:text-emerald-400 transition duration-300 ease-in-out"} size={20}/>
                <span className={"hidden sm:inline"}>Cart</span>
                {cart.length > 0 && <span className={"absolute -top-2 -left-2 bg-emerald-500 text-white rounded-full px-2 py-0.5" +
                  " text-xs" +
                  " group-hover:bg-emerald-400 transition duration-300 ease-in-out"}>
                  {cart.length}
                </span>}
              </Link>
            )}

            {isAdmin && (
              <Link to={"/admin-dashboard"} className={"bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1 rounded-md" +
                " font-medium" +
                " transition duration-300 ease-in-out flex items-center"}>
                <Lock className={"inline-block mr-1"} size={18}/>
                <span className={"hidden sm:inline"}>Dashboard</span>
              </Link>
            )}

            {user ? (
              <button onClick={handleLogout} className={"bg-gray-700 hover:bg-gray-600 text-white py-1 px-3 rounded-md flex" +
                " items-center transition duration-300 ease-in-out cursor-pointer"}>
                <LogOut size={18} className={"inline-block mr-2"}/>
                <span className={"hidden sm:inline"}>Logout</span>
              </button>
            ) : (
              <>
                <Link to={"/signup"} className={"bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-md flex" +
                  " items-center transition duration-300 ease-in-out"}>
                  <UserPlus size={18} className={"inline-block mr-2"}/>
                  <span className={"hidden sm:inline"}>Sign Up</span>
                </Link>
                <Link to={"/login"} className={"bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md flex" +
                  " items-center transition duration-300 ease-in-out"}>
                  <LogIn size={18} className={"inline-block mr-2"}/>
                  <span className={"hidden sm:inline"}>Login</span>
                </Link>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  )
}
export default Navbar
