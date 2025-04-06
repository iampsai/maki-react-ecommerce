import {useState} from 'react'
import {Link} from "react-router-dom";
import {UserPlus, Mail, Lock, User, Loader} from "lucide-react";
import {motion} from "framer-motion";
import {useUserStore} from "../stores/useUserStore.js";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // use user store
  const {signup, loading} = useUserStore();

  const handleSubmit = (e) => {
    e.preventDefault();
    // console.log(formData);
    signup(formData)
      .then(() => {
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        })
      });
  };

  return (
    <div className={"flex flex-col justify-center py-12 sm:px-6 lg:px-8"}>
      <motion.div
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.8, delay: 0.2}}
        className={"sm:mx-auto sm:w-full sm:max-w-md"}
      >
        <h2 className={"mt-6 text-center text-3xl font-extrabold text-emerald-400"}>Create Account</h2>
      </motion.div>

      <motion.div
        initial={{opacity: 0, y: -20}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.8, delay: 0.2}}
        className={"sm:mx-auto sm:w-full sm:max-w-md"}
      >
        <div className={"bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 mt-4"}>
          <form className={"space-y-6"} onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className={"block text-sm font-medium text-gray-400"}>
                Full Name
              </label>
              <div className={"mt-1 relative rounded-md shadow-sm"}>
                <div className={"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"}>
                  <User className={"h-5 w-5 text-gray-400"} aria-hidden={"true"}/>
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData?.name}
                  className={"block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 placeholder-gray-400" +
                    " focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder={"John Doe"}
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={"block text-sm font-medium text-gray-400"}>
                Email address
              </label>
              <div className={"mt-1 relative rounded-md shadow-sm"}>
                <div className={"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"}>
                  <Mail className={"h-5 w-5 text-gray-400"} aria-hidden={"true"}/>
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData?.email}
                  className={"block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 placeholder-gray-400" +
                    " focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder={"john@example.com"}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className={"block text-sm font-medium text-gray-400"}>
                Password
              </label>
              <div className={"mt-1 relative rounded-md shadow-sm"}>
                <div className={"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"}>
                  <Lock className={"h-5 w-5 text-gray-400"} aria-hidden={"true"}/>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData?.password}
                  className={"block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 placeholder-gray-400" +
                    " focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder={"••••••••"}
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className={"block text-sm font-medium text-gray-400"}>
                Confirm Password
              </label>
              <div className={"mt-1 relative rounded-md shadow-sm"}>
                <div className={"absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"}>
                  <Lock className={"h-5 w-5 text-gray-400"} aria-hidden={"true"}/>
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData?.confirmPassword}
                  className={"block w-full px-3 py-2 pl-10 bg-gray-700 border border-gray-600 placeholder-gray-400" +
                    " focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md"}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder={"••••••••"}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className={"flex w-full justify-center rounded-md border border-transparent bg-emerald-600 py-2 px-4 text-sm font-medium" +
                  " text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500" +
                  " focus:ring-offset-2"}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader className={"mr-2 h-5 w-5 animate-spin"} aria-hidden={"true"}/>
                    <span className={"ml-1"}>Loading...</span>
                  </>
                ) : (
                  <>
                    <UserPlus className={"mr-2 h-5 w-5"} aria-hidden={"true"}/>
                    <span className={"ml-1"}>Sign Up</span>
                  </>
                )}
              </button>
            </div>
          </form>

          <div className={"mt-6"}>
            <p className={"text-sm text-gray-400"}>
              Already have an account?{" "}
              <Link to={"/login"} className={"font-medium text-emerald-500 hover:text-emerald-400 transition duration-300" +
                " ease-in-out"}>Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
export default SignUpPage
