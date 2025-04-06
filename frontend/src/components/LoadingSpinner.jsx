import React from 'react'

const LoadingSpinner = () => {
  return (
    <div className={"flex items-center justify-center min-h-screen bg-gray-900"}>
      <div className={"relative"}>
        <div className={"w-20 h-20 border-emerald-200 border-2 rounded-full"}></div>
        <div className={"absolute top-0 left-0 w-20 h-20 border-emerald-500 rounded-full" +
          " animate-spin border-t-2"}></div>
        <div className={"sr-only"}>Loading</div>
      </div>
    </div>
  )
}
export default LoadingSpinner
