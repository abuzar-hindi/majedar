import { createContext, useEffect, useState } from "react";
// import { products } from "../assets/assets"; // use this in front end design and delete after backend created
import { products as productsFromAssets } from "../assets/assets";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const ShopContext = createContext(); // This is ShopContext API, you created

const ShopContextProvider = (props) => {
  const currency = "₹";
  const deliveryFee = 100;

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});

  // const [products, setProducts] = useState([]);  // this is for backend products data

  const [token, setToken] = useState("");
  const navigate = useNavigate();

  {
    /* Added "{}" empty object here to add objects in it. */
  }

  {
    /* addToCart (below) is an event handler funtion, which calls when user adds an item in cart (for example, button click event). (adding items in cart) When user gives an input or take an action. this's the reason why user didn't use useEffect bcz useEffect calls automatically when a component renders. */
  }

  const addToCart = (itemId, type) => {
    if (!type) {
      toast.error("Select type!");
      return;
    }

    let cartData = structuredClone(cartItems);

    if (cartData[itemId]) {
      cartData[itemId][type] = (cartData[itemId][type] || 0) + 1;
    } else {
      cartData[itemId] = { [type]: 1 };
    }

    setCartItems(cartData);

    // ✅ Save to localStorage
    localStorage.setItem("cartItems", JSON.stringify(cartData));

    // Show a clean minimal toast to confirm item addition
    try {
      const product = products.find((p) => p._id === itemId);
      if (product) {
        const productName = product.name || product.title || "Item";
        toast(`${productName} added to order`, {
          icon: false,
          autoClose: 1800,
          hideProgressBar: true,
        });
      }
    } catch (error) {
      // ignore toast errors
    }
  };

  useEffect(() => {
    const savedCart = localStorage.getItem("cartItems");
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  const getCartCounts = () => {
    let totalCounts = 0;

    for (const items in cartItems) {
      for (const item in cartItems[items]) {
        try {
          if (cartItems[items][item] > 0) {
            totalCounts += cartItems[items][item];
          }
        } catch (error) {}
      }
    }
    return totalCounts;
  };

  const updateQuantity = (itemId, size, quantity) => {
    let cartData = structuredClone(cartItems); // Deep copy of the cart items

    if (quantity <= 0) {
      // remove the size entry
      if (cartData[itemId]) {
        delete cartData[itemId][size];
        if (Object.keys(cartData[itemId]).length === 0) delete cartData[itemId];
      }
    } else {
      if (!cartData[itemId]) cartData[itemId] = {};
      cartData[itemId][size] = quantity;
    }

    setCartItems(cartData);

    // ✅ Save to localStorage
    localStorage.setItem("cartItems", JSON.stringify(cartData));

    // Note: backend sync (axios) removed to keep client standalone. If you enable backend later,
    // reintroduce network sync guarded by a configured BACKEND URL and token.
  };

  // Removed getUserCart backend sync — current app uses local storage for cart persistence.

  const getCartAmount = () => {
    let totalAmount = 0;

    for (const productId in cartItems) {
      const product = products.find((p) => p._id === productId);
      if (!product || !product.types) continue;

      for (const typeLabel in cartItems[productId]) {
        const quantity = cartItems[productId][typeLabel];
        if (quantity <= 0) continue;

        const typeObj = product.types.find((t) => t.label === typeLabel);

        if (typeObj) {
          totalAmount += typeObj.price * quantity;
        }
      }
    }

    return totalAmount;
  };

  // this is for backend products data
  // const getProductsData = async () => {
  //   try {
  //     const response = await axios.get(backend_url + "/api/product/list");

  //     if (response.data.success) {
  //       setProducts(response.data.products);
  //     } else {
  //       toast.error(response.data.message);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     toast.error(error.message);
  //   }
  // };

  // useEffect(() => {
  //   getProductsData();
  // }, []);

  const [products] = useState(productsFromAssets);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      setToken(storedToken); // Set the token
      // getUserCart(storedToken); // Fetch the cart
    }
  }, []);

  //   const getDescription = (category) => {
  //   if (category.includes("Tandoori")) return "Char-grilled in traditional tandoor";
  //   if (category.includes("Biryani")) return "Slow cooked aromatic dum biryani";
  //   if (category.includes("Chinese")) return "Indo-Chinese style tossed in sauces";
  //   return "Prepared fresh with quality ingredients";
  // };

  const value = {
    // These values will pass where you'll use this (ShopContext) API
    products, // You'll get products from here with the help of useContext(ShopContext);
    currency,
    deliveryFee,

    search,
    setSearch,
    showSearch,
    setShowSearch,

    cartItems,
    addToCart,

    getCartCounts,
    updateQuantity,
    getCartAmount,
    setCartItems,

    navigate,

    token,
    setToken,
  };

  return (
    <ShopContext.Provider value={value}>
      {props.children}{" "}
      {/* In this case, App.jsx (found in main.jsx) is the children props.children ensures that whatever is inside the ShopContextProvider is rendered correctly with the context values.  */}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;
