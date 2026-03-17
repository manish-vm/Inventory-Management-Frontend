import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus,
  ScanBarcode,
  Camera,
  X,
  Loader2,
  CheckCircle,
  Receipt,
  CreditCard,
  Banknote,
  ZoomIn,
  Package,
  Tag,
  Layers,
  DollarSign,
  Box,
  AlertCircle,
  Info,
  ShoppingBag
} from 'lucide-react';
import Barcode from 'react-barcode';
import { productAPI, billingAPI, employeeAPI } from '../api/api';
import { useAuth } from '../context/AuthContext';

// Helper function to encode product details into barcode (table format)
const encodeProductForBarcode = (product) => {
  // Table format: PC:code|N:name|Q:quantity
  return `PC:${product.productCode}|N:${product.productName}`;
};

// Helper function to decode product from barcode
const decodeProductFromBarcode = (barcodeData) => {
  try {
    // Parse table format: PC:code|N:name
    const parts = barcodeData.split('|');
    const result = {};
    parts.forEach(part => {
      const [key, value] = part.split(':');
      if (key === 'PC') result.productCode = value;
      if (key === 'N') result.productName = value;
    });
    return result.productCode || result.productName ? result : null;
  } catch (e) {
    return null;
  }
};

// Enhanced Barcode Popup Modal Component with full product details
const BarcodePopup = ({ product, onClose, onAddToCart }) => {
  if (!product) return null;

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  const discount = product.sellingPrice && product.basePrice 
    ? Math.round(((product.basePrice - product.sellingPrice) / product.basePrice) * 100)
    : 0;

  // Generate barcode value with all product details
  const barcodeValue = encodeProductForBarcode(product);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Barcode */}
        <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Product Details</h2>
            <button onClick={onClose} className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors">
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          
          {/* Large Barcode Display with full product details */}
          <div className="bg-white rounded-xl p-4 flex flex-col items-center">
            <Barcode 
              value={barcodeValue} 
              format="CODE128"
              width={1}
              height={60}
              displayValue={false}
              background="#ffffff"
              lineColor="#000000"
            />
          </div>
          <p className="text-center text-white/60 text-xs mt-2 font-mono break-all">
            {barcodeValue.substring(0, 50)}...
          </p>
        </div>

        {/* Product Info */}
        <div className="p-6 space-y-4">
          {/* Product Name */}
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{product.productName}</h3>
            {product.category && (
              <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full text-sm text-slate-600 dark:text-slate-400">
                <Tag className="w-4 h-4" />
                {product.category.name}
              </span>
            )}
            {product.subcategory && (
              <span className="inline-flex items-center gap-1 mt-2 ml-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/30 rounded-full text-sm text-primary-600 dark:text-primary-400">
                <Layers className="w-4 h-4" />
                {product.subcategory.name}
              </span>
            )}
          </div>

          {/* Price Section */}
          <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Selling Price</p>
                <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                  {formatCurrency(product.sellingPrice || product.basePrice)}
                </p>
              </div>
              {discount > 0 && (
                <div className="text-right">
                  <p className="text-sm text-slate-500 dark:text-slate-400">Base Price</p>
                  <p className="text-lg font-medium text-slate-400 line-through">
                    {formatCurrency(product.basePrice)}
                  </p>
                  <span className="inline-flex items-center px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium rounded-lg">
                    {discount}% OFF
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Stock Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border ${
              product.stockQuantity <= product.minStockLevel
                ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                : 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Box className={`w-5 h-5 ${
                  product.stockQuantity <= product.minStockLevel
                    ? 'text-red-500'
                    : 'text-green-500'
                }`} />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Stock</span>
              </div>
              <p className={`text-xl font-bold ${
                product.stockQuantity <= product.minStockLevel
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-green-600 dark:text-green-400'
              }`}>
                {product.stockQuantity}
              </p>
              {product.stockQuantity <= product.minStockLevel && (
                <p className="text-xs text-red-500 mt-1">Low Stock Alert!</p>
              )}
            </div>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 mb-1">
                <AlertCircle className="w-5 h-5 text-slate-500" />
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Min Level</span>
              </div>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {product.minStockLevel}
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b border-slate-200 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Product Code</span>
              <span className="font-mono font-medium text-slate-900 dark:text-white">{product.productCode}</span>
            </div>
            {product.description && (
              <div className="py-2">
                <span className="text-slate-500 dark:text-slate-400 block mb-1">Description</span>
                <p className="text-slate-900 dark:text-white">{product.description}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              Close
            </button>
            {onAddToCart && (
              <button
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                disabled={product.stockQuantity < 1}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-5 h-5" />
                Add to Cart
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Billing = () => {
  const { user, isCustomer } = useAuth();
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [scannedCode, setScannedCode] = useState('');
  const [zoom, setZoom] = useState(1);
  const [checkoutData, setCheckoutData] = useState({
    customerName: '',
    paymentMethod: 'cash',
    referredEmployee: ''
  });
  const [activeEmployees, setActiveEmployees] = useState([]);  
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [showReceipt, setShowReceipt] = useState(null);
  const [error, setError] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showBarcodePopup, setShowBarcodePopup] = useState(null);
  
  const barcodeInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Set default customer name when checkout modal opens for customers
  useEffect(() => {
    if (showCheckout && isCustomer && user?.username) {
      setCheckoutData(prev => ({
        ...prev,
        customerName: user.username
      }));
    }
  }, [showCheckout, isCustomer, user]);

  // Auto-focus barcode input on mount and when not searching
  useEffect(() => {
    if (!search && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [search]);

  // Search products by name, code, or price
  useEffect(() => {
    const searchProducts = async () => {
      if (!search.trim()) {
        setSearchResults([]);
        return;
      }
      
      // Check if search is a number (could be price search)
      const searchNum = parseFloat(search.replace(/[₹,]/g, ''));
      const isPriceSearch = !isNaN(searchNum) && searchNum > 0;
      
      try {
        // Get all products first
        const response = await productAPI.getAll({});
        let allProducts = response.data;
        
        // Filter products based on search term
        let results = allProducts.filter(product => {
          const searchLower = search.toLowerCase();
          
          // Search by product name
          const matchesName = product.productName?.toLowerCase().includes(searchLower);
          
          // Search by product code
          const matchesCode = product.productCode?.toLowerCase().includes(searchLower);
          
          // Search by price (exact or partial match)
          const productPrice = product.sellingPrice?.toString();
          const matchesPrice = isPriceSearch && (
            productPrice === searchNum.toString() || 
            productPrice.includes(searchNum.toString())
          );
          
          return matchesName || matchesCode || matchesPrice;
        });
        
        setSearchResults(results.slice(0, 10));
      } catch (error) {
        console.error('Search error:', error);
        setSearchResults([]);
      }
    };
    
    const debounce = setTimeout(searchProducts, 300);
    return () => clearTimeout(debounce);
  }, [search]);

  // Load all products and active employees
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch products
        const productsRes = await productAPI.getAll({});
        setProducts(productsRes.data.filter(p => p.stockQuantity > 0));
      } catch (error) {
        console.error('Failed to fetch products:', error);
      }

      try {
        // Fetch active employees
        const employeesRes = await employeeAPI.getActiveEmployees();
        setActiveEmployees(employeesRes.data || []);
      } catch (error) {
        console.error('Failed to fetch employees:', error);
        setActiveEmployees([]);
      }
    };
    fetchInitialData();
  }, []);

  const addToCart = (product) => {
    const existing = cart.find(item => item.productId === product._id);
    if (existing) {
      if (existing.quantity >= product.stockQuantity) {
        alert('Insufficient stock!');
        return;
      }
      setCart(cart.map(item => 
        item.productId === product._id 
          ? { ...item, quantity: item.quantity + 1, total: (item.quantity + 1) * item.sellingPrice }
          : item
      ));
    } else {
      if (product.stockQuantity < 1) {
        alert('Product out of stock!');
        return;
      }
      setCart([...cart, {
        productId: product._id,
        productName: product.productName,
        productCode: product.productCode,
        sellingPrice: product.sellingPrice,
        quantity: 1,
        total: product.sellingPrice,
        stockQuantity: product.stockQuantity
      }]);
    }
    setSearch('');
    setSearchResults([]);
    barcodeInputRef.current?.focus();
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.productId === productId) {
        const newQty = item.quantity + delta;
        if (newQty < 1) return item;
        if (newQty > item.stockQuantity) {
          alert('Insufficient stock!');
          return item;
        }
        return { ...item, quantity: newQty, total: newQty * item.sellingPrice };
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    barcodeInputRef.current?.focus();
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.total, 0);
  const cartItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = async () => {
  // For customers, ensure customer name is set
  if (isCustomer && !checkoutData.customerName) {
    setError('Please enter your name');
    return;
  }
  
  if (!checkoutData.referredEmployee) {
    setError('Please select referred employee');
    return;
  }
    
    setProcessing(true);
    setError(null);
    try {
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity
      }));
      
      const response = await billingAPI.checkout({
        items,
        customerName: checkoutData.customerName || 'Walk-in Customer',
        paymentMethod: checkoutData.paymentMethod,
        referredEmployee: checkoutData.referredEmployee
      });
      
      setShowReceipt(response.data.invoice);
      setCart([]);
      setShowCheckout(false);
      setCheckoutData({ customerName: '', paymentMethod: 'cash' });
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Checkout failed';
      setError(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(value || 0);
  };

  // Handle barcode scanning (Enter key)
  const handleBarcodeScan = (e) => {
    if (e.key === 'Enter' && search) {
      if (searchResults.length === 1) {
        addToCart(searchResults[0]);
      } else if (searchResults.length > 1) {
        // Multiple results - let user choose
        searchInputRef.current?.focus();
      }
    }
  };

  // Start camera for barcode scanning
  const startScanner = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowScanner(true);
      }
    } catch (err) {
      alert('Unable to access camera. Please use manual entry.');
    }
  };

  // Stop camera
  const stopScanner = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setShowScanner(false);
  };

  // Handle manual code entry from scanner
  const handleScannedCode = async (code) => {
    if (!code) return;
    setScannedCode(code);
    
    // Try to decode as JSON (new format with product details)
    const decodedProduct = decodeProductFromBarcode(code);
    
    if (decodedProduct && decodedProduct.productName) {
      // Found product details in barcode - add to cart
      addToCart({
        _id: decodedProduct.productName, // Use name as fallback ID
        productName: decodedProduct.productName,
        productCode: decodedProduct.productCode,
        sellingPrice: decodedProduct.sellingPrice,
        basePrice: decodedProduct.basePrice,
        stockQuantity: decodedProduct.stockQuantity,
        minStockLevel: decodedProduct.minStockLevel,
        category: decodedProduct.category,
        subcategory: decodedProduct.subcategory
      });
      stopScanner();
      return;
    }
    
    // Fallback: try to find product by code from API
    try {
      const product = await productAPI.getByCode(code);
      addToCart(product.data);
      stopScanner();
    } catch (err) {
      alert('Product not found for code: ' + code);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Billing / POS</h1>
          <p className="text-slate-500 dark:text-slate-400">Search products by name, code, or price</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={startScanner}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl"
          >
            <Camera className="w-5 h-5" />
            Scan
          </button>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl"
            >
              Clear Cart
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Panel - Product Search & List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Product Search Bar */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-400" />
              <input
                ref={barcodeInputRef}
                type="text"
                placeholder="Search products by name, code, or price..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleBarcodeScan}
                className="w-full pl-14 pr-4 py-4 text-lg rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                autoFocus
              />
              {search && (
                <button
                  onClick={() => {
                    setSearch('');
                    barcodeInputRef.current?.focus();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-100 dark:hover:bg-slate-600 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Search Results Dropdown */}
            {searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm text-slate-500 dark:text-slate-400">Found {searchResults.length} product(s):</p>
                {searchResults.map((product) => (
                  <button
                    key={product._id}
                    onClick={() => addToCart(product)}
                    className="w-full flex items-center justify-between p-4 bg-primary-50 dark:bg-primary-900/30 hover:bg-primary-100 dark:hover:bg-primary-900/50 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <p className="font-semibold text-slate-900 dark:text-white">{product.productName}</p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Code: {product.productCode}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{formatCurrency(product.sellingPrice)}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">Stock: {product.stockQuantity}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* No Results Message */}
            {search && searchResults.length === 0 && !loading && (
              <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl text-center">
                <p className="text-slate-500 dark:text-slate-400">No products found matching "{search}"</p>
                <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">Try searching by name, code, or price</p>
              </div>
            )}
          </div>

          {/* Products Grid */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-200 dark:border-slate-700">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
              Products ({products.length})
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto">
              {products.map((product) => (
                <div
                  key={product._id}
                  className="p-4 bg-slate-50 dark:bg-slate-700/50 hover:bg-primary-50 dark:hover:bg-primary-900/30 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-1 rounded">
                      {product.productCode}
                    </span>
                    {product.stockQuantity <= product.minStockLevel && (
                      <span className="text-xs text-red-500">Low</span>
                    )}
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white text-sm mb-1 truncate">
                    {product.productName}
                  </p>
                  <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                    {formatCurrency(product.sellingPrice)}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Stock: {product.stockQuantity}
                  </p>
                  <div className="block gap-2 mt-3">
                    <button
                      onClick={() => setShowBarcodePopup(product)}
                      className="flex-1 py-2 px-3 bg-slate-200 dark:bg-slate-600 hover:bg-slate-300 dark:hover:bg-slate-500 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                    >
                      <ScanBarcode className="w-3 h-3" />
                      View Barcode
                    </button>
  
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stockQuantity < 1}
                      className="flex-1 py-2 px-3 mt-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel - Cart */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-[calc(159vh-200px)]">
          {/* Cart Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary-600" />
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Cart ({cartItems})
              </h2>
            </div>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-slate-400">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-50" />
                <p>Cart is empty</p>
                <p className="text-sm">Scan products to add</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl"
                >
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white text-sm">
                      {item.productName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {formatCurrency(item.sellingPrice)} each
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.productId, -1)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="p-1 text-center font-medium">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, 1)}
                      className="p-1 hover:bg-slate-200 dark:hover:bg-slate-600 rounded"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="text-right -ml-[6px]">
                    <p className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(item.total)}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Footer */}
          {cart.length > 0 && (
            <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-4">
              <div className="flex items-center justify-between text-lg">
                <span className="font-semibold text-slate-900 dark:text-white">Total</span>
                <span className="font-bold text-primary-600 dark:text-primary-400 text-2xl">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
              <button
                onClick={() => setShowCheckout(true)}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl flex items-center justify-center gap-2"
              >
                <CheckCircle className="w-5 h-5" />
                Checkout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Checkout</h2>
              <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total Amount</span>
                  <span className="text-primary-600 dark:text-primary-400">{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Customer Name (Optional)
                </label>
                <input
                  type="text"
                  value={checkoutData.customerName}
                  onChange={(e) => setCheckoutData({ ...checkoutData, customerName: e.target.value })}
                  placeholder="Walk-in Customer"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Referred Employee <span className="text-red-500">*</span>
                </label>
                <select
                  value={checkoutData.referredEmployee}
                  onChange={(e) => setCheckoutData({ ...checkoutData, referredEmployee: e.target.value })}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                >
                  <option value="">Select Employee</option>
                  {activeEmployees.map(emp => (
                    <option key={emp._id} value={emp._id}>
                      {emp.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['cash', 'card', 'online'].map((method) => (
                    <button
                      key={method}
                      onClick={() => setCheckoutData({ ...checkoutData, paymentMethod: method })}
                      className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-colors ${
                        checkoutData.paymentMethod === method
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                          : 'border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {method === 'cash' && <Banknote className="w-6 h-6" />}
                      {method === 'card' && <CreditCard className="w-6 h-6" />}
                      {method === 'online' && <Receipt className="w-6 h-6" />}
                      <span className="text-sm capitalize">{method}</span>
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleCheckout}
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Complete Sale
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Receipt</h2>
                <p className="text-sm text-slate-500">{showReceipt.invoiceNumber}</p>
              </div>
              <button onClick={() => setShowReceipt(null)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 h-[400px] overflow-y-auto">
              <div className="text-center py-4">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-900 dark:text-white">Payment Successful!</p>
              </div>

              <div className="space-y-2 text-sm">
                {showReceipt.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-slate-600 dark:text-slate-400">
                      {item.quantity}x {item.productName}
                    </span>
                    <span className="font-medium text-slate-900 dark:text-white">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                <div className="flex items-center justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span className="text-primary-600 dark:text-primary-400">
                    {formatCurrency(showReceipt.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                <p>Thank you for your purchase!</p>
                <p>{new Date(showReceipt.createdAt).toLocaleString()}</p>
              </div>

              <button
                onClick={() => setShowReceipt(null)}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Barcode Popup Modal */}
      {showBarcodePopup && (
        <BarcodePopup 
          product={showBarcodePopup} 
          onClose={() => setShowBarcodePopup(null)}
          onAddToCart={addToCart}
        />
      )}

      {/* Camera Scanner Modal */}
      {showScanner && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Scan Barcode</h2>
              <button onClick={stopScanner} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
<div className="relative overflow-hidden">
              <video 
                ref={videoRef}
                className="w-full h-64 md:h-80 object-cover transition-transform duration-200"
                style={{ transform: `scale(${zoom})` }}
                autoPlay
                playsInline
              />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-32 border-2 border-primary-500 rounded-lg opacity-75"></div>
              </div>
              <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
            
<div className="p-4 border-t border-slate-200 dark:border-slate-700">
              {/* Zoom Control */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
                <ZoomIn className="w-5 h-5 text-primary-600 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Zoom</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{Math.round(zoom * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-300 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Camera className="w-5 h-5 text-primary-600" />
                <span className="text-sm text-slate-600 dark:text-slate-400">
                  Position the barcode within the frame
                </span>
              </div>
              
              {/* Manual Code Entry */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Or enter code manually:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={scannedCode}
                    onChange={(e) => setScannedCode(e.target.value)}
                    placeholder="Enter product code..."
                    className="flex-1 px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && scannedCode) {
                        handleScannedCode(scannedCode);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleScannedCode(scannedCode)}
                    disabled={!scannedCode}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl disabled:opacity-50"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;


