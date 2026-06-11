 
// import React from 'react';
// import { useDispatch, useSelector } from 'react-redux';
// import { addToCart } from '../../actions/cartActions';
// import { addToCartWithSync } from '../../actions/POS/cartActions';

// const ProductCard = ({ product, darkMode }) => {
//   const dispatch = useDispatch();
//   const { tabs, activeTabId } = useSelector((state) => state.cart);
//   const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
//   const { items } = activeTab;

//   const handleAddToCart = (e) => {
//     e.stopPropagation();
//     if (product.stock <= 0) {
//       return;
//     }
//     const existingCartItem = items.find(item => item.id === product.id);
//     if (existingCartItem) {
//       if (existingCartItem.quantity >= product.stock) {
//         return;
//       }
//     }
//     dispatch(addToCartWithSync(product));
//   };

//   const getProductIcon = (category) => {
//     const iconMap = {
//       'electronics': 'fas fa-microchip',
//       'computers': 'fas fa-laptop',
//       'phones': 'fas fa-mobile-alt',
//       'accessories': 'fas fa-headphones',
//       'components': 'fas fa-microchip',
//       'default': 'fas fa-box'
//     };
//     return iconMap[category?.toLowerCase()] || iconMap.default;
//   };

//   const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
//   const discountPercentage = hasDiscount && product.price > 0
//     ? ((product.price - product.discountedPrice) / product.price) * 100
//     : 0;

//   const existingCartItem = items.find(item => item.id === product.id);
//   const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
//   const availableQuantity = product.stock - currentCartQuantity;

//   return (
//     <div
//       onClick={handleAddToCart}
//       className={`flex flex-col items-center p-1 md:p-1 rounded-xl text-center transition-all cursor-pointer border ${
//         darkMode
//           ? 'bg-gray-800 border-gray-700 hover:border-green-500'
//           : 'bg-white border-gray-200 hover:border-green-500'
//       } hover:shadow-lg hover:-translate-y-1 h-28 md:h-36 relative overflow-hidden ${
//         availableQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
//       }`}
//     >
//       {/* Out of Stock Label */}
//       {availableQuantity <= 0 && (
//         <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-gray-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-semibold z-10">
//           OUT
//         </div>
//       )}
      
//       {/* Low Stock Label */}
//       {availableQuantity > 0 && availableQuantity < 5 && (
//         <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-red-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-semibold z-10">
//           LOW
//         </div>
//       )}
      
//       {/* Discount Label - Positioned on top left */}
//       {hasDiscount && discountPercentage > 0 && (
//         <div className="absolute top-1 md:top-2 left-1 md:left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-semibold z-10 shadow-md">
//           {discountPercentage.toFixed(1)}% OFF
//         </div>
//       )}
      
//       <div
//         className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-white text-sm md:text-lg shadow-md mb-1 md:mb-2 bg-cover bg-center"
//         style={{
//           backgroundImage: product.image ? `url(${product.image})` : 'linear-gradient(145deg, #388E3C, #4CAF50)',
//           backgroundColor: product.image ? 'transparent' : '',
//         }}
//       >
//         {!product.image && <i className={getProductIcon(product.category)}></i>}
//       </div>
      
//       <div className={`font-semibold text-xs mb-1 ${darkMode ? 'text-white' : 'text-gray-800'} h-8 md:h-10 flex items-center justify-center px-1`}>
//         {product.name.length > 20 ? `${product.name.substring(0, 20)}...` : product.name}
//       </div>
      
//       {/* Price Display with Discount */}
//       <div className="flex flex-col items-center">
//         {hasDiscount ? (
//           <>
//             <span className="text-gray-400 dark:text-gray-500 line-through text-xs">
//               Rs. {product.price.toFixed(2)}
//             </span>
//             <span className="text-green-500 font-bold text-xs">
//               Rs. {product.discountedPrice.toFixed(2)}
//             </span>
//           </>
//         ) : (
//           <span className="text-green-500 font-bold text-xs">
//             Rs. {product.price.toFixed(2)}
//           </span>
//         )}
//       </div>
      
//       {/* Enhanced Stock Display */}
//       <div className={`text-xs ${
//         availableQuantity <= 0 ? 'text-red-500 font-semibold' :
//         availableQuantity < 5 ? 'text-yellow-500 font-semibold' :
//         darkMode ? 'text-gray-400' : 'text-gray-500'
//       }`}>
//         {availableQuantity <= 0 ? 'Out of Stock' :
//          currentCartQuantity > 0 ? `Stock: ${availableQuantity} left` :
//          `Stock: ${product.stock}`}
//       </div>
//     </div>
//   );
// };

// export default ProductCard;








import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

const ProductCard = ({ product, darkMode, onAddToCart }) => {
  const dispatch = useDispatch();
  const { tabs, activeTabId } = useSelector((state) => state.cart);
  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];
  const { items } = activeTab;

  const [imageSrc, setImageSrc] = React.useState(product.image);

  React.useEffect(() => {
    setImageSrc(product.image);
  }, [product.image]);

  const handleImageError = () => {
    if (imageSrc && imageSrc.includes('/Products/ServeImage?fileName=')) {
      if (imageSrc.endsWith('.jpeg')) {
        setImageSrc(imageSrc.replace('.jpeg', '.jpg'));
      } else if (imageSrc.endsWith('.jpg')) {
        setImageSrc(imageSrc.replace('.jpg', '.png'));
      } else {
        setImageSrc(null);
      }
    } else {
      setImageSrc(null);
    }
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (product.stock <= 0) {
      return;
    }
    
    if (onAddToCart) {
      onAddToCart();
    }
  };

  const getProductIcon = (category) => {
    const iconMap = {
      'electronics': 'fas fa-microchip',
      'computers': 'fas fa-laptop',
      'phones': 'fas fa-mobile-alt',
      'accessories': 'fas fa-headphones',
      'components': 'fas fa-microchip',
      'default': 'fas fa-box'
    };
    const catStr = category ? String(category).toLowerCase() : '';
    return iconMap[catStr] || iconMap.default;
  };

  const hasDiscount = product.discountedPrice && product.discountedPrice < product.price;
  const discountPercentage = hasDiscount && product.price > 0
    ? ((product.price - product.discountedPrice) / product.price) * 100
    : 0;

  const existingCartItem = items.find(item => item.id === product.id);
  const currentCartQuantity = existingCartItem ? existingCartItem.quantity : 0;
  const availableQuantity = product.stock - currentCartQuantity;

  return (
    <div
      onClick={handleAddToCart}
      className={`flex flex-col items-center p-1 md:p-1 rounded-xl text-center transition-all cursor-pointer border ${
        darkMode
          ? 'bg-gray-800 border-gray-700 hover:border-green-500'
          : 'bg-white border-gray-200 hover:border-green-500'
      } hover:shadow-lg hover:-translate-y-1 h-28 md:h-36 relative overflow-hidden ${
        availableQuantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {imageSrc && (
        <img
          src={imageSrc}
          className="hidden"
          onError={handleImageError}
          alt=""
        />
      )}

      {/* Batch indicator for multi-batch products */}
      {product.hasMultipleBatches && product.totalBatches > 1 && (
        <div className="absolute top-1 md:top-2 left-1 md:left-2 bg-blue-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-semibold z-10">
          {product.totalBatches} Batches
        </div>
      )}
      
      {/* Out of Stock Label */}
      {availableQuantity <= 0 && (
        <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-gray-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-semibold z-10">
          OUT
        </div>
      )}
      
      {/* Low Stock Label */}
      {availableQuantity > 0 && availableQuantity < 5 && (
        <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-red-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-semibold z-10">
          LOW
        </div>
      )}
      
      {/* Discount Label - Positioned on top left */}
      {hasDiscount && discountPercentage > 0 && (
        <div className="absolute top-1 md:top-2 left-1 md:left-2 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs px-1 md:px-2 py-0.5 md:py-1 rounded-full font-semibold z-10 shadow-md">
          {discountPercentage.toFixed(1)}% OFF
        </div>
      )}
      
      <div
        className="w-12 h-12 md:w-16 md:h-16 rounded-lg flex items-center justify-center text-white text-sm md:text-lg shadow-md mb-1 md:mb-2 bg-cover bg-center"
        style={{
          backgroundImage: imageSrc ? `url(${imageSrc})` : 'linear-gradient(145deg, #388E3C, #4CAF50)',
          backgroundColor: imageSrc ? 'transparent' : '',
        }}
      >
        {!imageSrc && <i className={getProductIcon(product.category)}></i>}
      </div>
      
      <div className={`font-semibold text-xs mb-0 ${darkMode ? 'text-white' : 'text-gray-800'} h-7 md:h-9 flex items-end justify-center px-1 pb-0.5`}>
        <span className="text-center">{product.name.length > 20 ? `${product.name.substring(0, 20)}...` : product.name}</span>
      </div>
      
      {/* Price Display with Discount */}
      <div className="flex flex-col items-center">
        {hasDiscount ? (
          <>
            <span className="text-gray-400 dark:text-gray-500 line-through text-xs">
              Rs. {product.price.toFixed(2)}
            </span>
            <span className="text-green-500 font-bold text-xs">
              Rs. {product.discountedPrice.toFixed(2)}
            </span>
          </>
        ) : (
          <span className="text-green-500 font-bold text-xs">
            Rs. {product.price.toFixed(2)}
          </span>
        )}
      </div>
      

 
      {/* Show "Click to select batch" for multi-batch products */}
      {product.hasMultipleBatches && product.totalBatches > 1 && (
        <div className="text-[10px] text-blue-500 dark:text-blue-400 font-medium mt-0.5">
          Click to select batch
        </div>
      )}
    </div>
  );
};

export default ProductCard;
