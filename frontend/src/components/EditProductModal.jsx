import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, Upload, Loader, X } from "lucide-react";
import { useProductStore } from "../stores/useProductStore.js";

const categories = ["handlebars", "forks", "shifters", "brakes", "pedals", "saddles", "wheels"];

const EditProductModal = ({ product, onClose }) => {
  const [editedProduct, setEditedProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    image: "",
    isFeatured: false
  });
  const [imagePreview, setImagePreview] = useState("");
  const [newImage, setNewImage] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { updateProduct } = useProductStore();

  useEffect(() => {
    if (product) {
      setEditedProduct({
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        category: product.category || "",
        image: product.image || "",
        isFeatured: product.isFeatured || false
      });
      setImagePreview(product.image || "");
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // If we have a new image, include it in the update
      const dataToUpdate = {
        ...editedProduct,
        image: newImage || editedProduct.image
      };
      
      await updateProduct(product._id, dataToUpdate);
      onClose();
    } catch (error) {
      console.error("Error updating product", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setNewImage(reader.result);
        setImagePreview(reader.result);
      };

      reader.readAsDataURL(file);
    }
  };

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="relative inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <motion.div
        className="bg-gray-800 shadow-lg rounded-lg p-6 w-full max-w-xl mx-auto relative"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          onClick={onClose}
        >
          <X className="h-6 w-6" />
        </button>
        
        <h2 className="text-2xl font-semibold mb-6 text-emerald-300">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300">
              Product Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={editedProduct.name}
              onChange={(e) => setEditedProduct({ ...editedProduct, name: e.target.value })}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2
               px-3 text-white focus:outline-none focus:ring-2
              focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={editedProduct.description}
              onChange={(e) => setEditedProduct({ ...editedProduct, description: e.target.value })}
              rows="3"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
               py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
               focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-300">
              Price
            </label>
            <input
              type="number"
              id="price"
              name="price"
              value={editedProduct.price}
              onChange={(e) => setEditedProduct({ ...editedProduct, price: e.target.value })}
              step="0.01"
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm
              py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500
               focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-300">
              Category
            </label>
            <select
              id="category"
              name="category"
              value={editedProduct.category}
              onChange={(e) => setEditedProduct({ ...editedProduct, category: e.target.value })}
              className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md
               shadow-sm py-2 px-3 text-white focus:outline-none
               focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="featured" className="flex items-center text-sm font-medium text-gray-300">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={editedProduct.isFeatured}
                onChange={(e) => setEditedProduct({ ...editedProduct, isFeatured: e.target.checked })}
                className="mr-2 h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-600 rounded bg-gray-700"
              />
              Featured Product
            </label>
          </div>

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Product Image
            </label>
            
            {imagePreview && (
              <div className="mb-3 relative w-32 h-32 mx-auto">
                <img 
                  src={imagePreview} 
                  alt="Product preview" 
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
            )}
            
            <div className="flex items-center justify-center">
              <input type="file" id="image" className="sr-only" accept="image/*" onChange={handleImageChange} />
              <label
                htmlFor="image"
                className="cursor-pointer bg-gray-700 py-2 px-3 border border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                <Upload className="h-5 w-5 inline-block mr-2" />
                {imagePreview ? "Change Image" : "Upload Image"}
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="button"
              onClick={onClose}
              className="mr-3 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default EditProductModal;
