// ============================================================
// Majedar Restaurant — Menu Data & Asset References
// Source of truth for all products. Will be replaced by
// database-driven data when backend is connected.
// ============================================================

const dishImageUrl = (dishName) => {
  const searchTerms = dishName.toLowerCase().replace(/[^a-z0-9]+/g, ",");
  const lock = [...dishName].reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) % 100000,
    7
  );
  return `https://loremflickr.com/640/480/${searchTerms},food?lock=${lock}`;
};

// UI Asset paths (served from /public/assets/)
export const assets = {
  google_pay: "/assets/google-pay.png",
  PhonePe: "/assets/PhonePe.webp",
  cart_icon: "/assets/cart_icon.png",
  bin_icon: "/assets/bin_icon.png",
  dropdown_icon: "/assets/dropdown_icon.png",
  profile_icon: "/assets/profile_icon.png",
  quality_icon: "/assets/quality_icon.png",
  search_icon: "/assets/search_icon.png",
  star_dull_icon: "/assets/star_dull_icon.png",
  star_icon: "/assets/star_icon.png",
  support_img: "/assets/support_img.png",
  menu_icon: "/assets/menu_icon.png",
  contact_img: "/assets/contact_img.png",
  cross_icon: "/assets/cross_icon.png",
};

export const products = [
  // 1. Breakfast
  { _id: "brk_001", name: "Aloo Poha", category: "Breakfast", description: "Light flattened rice cooked with seasoned potatoes, mustard seeds & spices.", images: [dishImageUrl("Aloo Poha")], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "brk_002", name: "Paneer Pakoda", category: "Breakfast", description: "Crispy fried cottage cheese fritters served hot.", images: [dishImageUrl("Paneer Pakoda")], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "brk_003", name: "Aloo Paratha", category: "Breakfast", description: "Whole wheat stuffed flatbread filled with spiced mashed potatoes.", images: [dishImageUrl("Aloo Paratha")], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "brk_004", name: "Paneer Paratha", category: "Breakfast", description: "Fresh paneer stuffed flatbread with Indian herbs.", images: [dishImageUrl("Paneer Paratha")], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "brk_005", name: "Aloo Gobhi Paratha", category: "Breakfast", description: "Spiced potato and cauliflower stuffed griddled paratha.", images: [dishImageUrl("Aloo Gobhi Paratha")], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "brk_006", name: "Chola Bhatura", category: "Breakfast", description: "Spicy chickpea curry paired with fluffy deep-fried bhature.", images: [dishImageUrl("Chola Bhatura")], types: [{ label: "Full", price: 70 }], price: 70, bestseller: true, isVeg: true },
  { _id: "brk_007", name: "Chola Puri", category: "Breakfast", description: "Aromatic chola served with puffed golden puris.", images: [dishImageUrl("Chola Puri")], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "brk_008", name: "Chola Chawal", category: "Breakfast", description: "Classic North Indian comfort meal of spiced chole with steamed rice.", images: [dishImageUrl("Chola Chawal")], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },

  // 2. South Indian
  { _id: "sth_001", name: "Idli Sambhar", category: "South Indian", description: "Steamed rice cakes served with hot lentil sambhar & chutney.", images: [dishImageUrl("Idli Sambhar")], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "sth_002", name: "Plain Dosa", category: "South Indian", description: "Crispy golden fermented crepe served with sambhar and chutneys.", images: [dishImageUrl("Plain Dosa")], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "sth_003", name: "Masala Dosa", category: "South Indian", description: "Crisp dosa filled with spiced potato masala.", images: [dishImageUrl("Masala Dosa")], types: [{ label: "Full", price: 110 }], price: 110, bestseller: true, isVeg: true },
  { _id: "sth_004", name: "Butter Masala Dosa", category: "South Indian", description: "Rich butter-crusted dosa stuffed with savory potato masala.", images: [dishImageUrl("Butter Masala Dosa")], types: [{ label: "Full", price: 130 }], price: 130, isVeg: true },

  // 3. Tea & Coffee
  { _id: "tea_001", name: "Milk Tea", category: "Tea & Coffee", description: "Traditional hot brewed chai with milk and cardamom.", images: [dishImageUrl("Milk Tea")], types: [{ label: "Full", price: 20 }], price: 20, isVeg: true },
  { _id: "tea_002", name: "Masala Tea", category: "Tea & Coffee", description: "Aromatic tea infused with fresh ginger and mixed spices.", images: [dishImageUrl("Masala Tea")], types: [{ label: "Full", price: 25 }], price: 25, isVeg: true },
  { _id: "tea_003", name: "Black Tea", category: "Tea & Coffee", description: "Refreshing clear hot black tea.", images: [dishImageUrl("Black Tea")], types: [{ label: "Full", price: 30 }], price: 30, isVeg: true },
  { _id: "tea_004", name: "Hot Coffee", category: "Tea & Coffee", description: "Freshly whipped rich hot coffee.", images: [dishImageUrl("Hot Coffee")], types: [{ label: "Full", price: 40 }], price: 40, isVeg: true },
  { _id: "tea_005", name: "Cold Coffee", category: "Tea & Coffee", description: "Chilled creamy blended coffee topped with chocolate powder.", images: [dishImageUrl("Cold Coffee")], types: [{ label: "Full", price: 110 }], price: 110, isVeg: true },

  // 4. Momos
  { _id: "mom_001", name: "Steam Momos", category: "Momos", description: "Soft steamed vegetable dumplings with spicy red dip.", images: [dishImageUrl("Steam Momos")], types: [{ label: "Full", price: 60 }], price: 60, bestseller: true, isVeg: true },
  { _id: "mom_002", name: "Veg Fry Momos", category: "Momos", description: "Golden pan-fried momos filled with seasoned veggies.", images: [dishImageUrl("Veg Fry Momos")], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "mom_003", name: "Tandoori Momos", category: "Momos", description: "Charcoal-tossed smoked momos marinated in tandoori masala.", images: [dishImageUrl("Tandoori Momos")], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },

  // 5. Maggi
  { _id: "mag_001", name: "Veg Maggi", category: "Maggi", description: "Classic street-style noodles tossed with green veggies.", images: [dishImageUrl("Veg Maggi")], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "mag_002", name: "Paneer Maggi", category: "Maggi", description: "Maggi noodles loaded with soft paneer cubes.", images: [dishImageUrl("Paneer Maggi")], types: [{ label: "Full", price: 90 }], price: 90, isVeg: true },
  { _id: "mag_003", name: "Cheese Maggi", category: "Maggi", description: "Creamy melted cheese infused instant noodles.", images: [dishImageUrl("Cheese Maggi")], types: [{ label: "Full", price: 100 }], price: 100, isVeg: true },
  { _id: "mag_004", name: "Cheese Paneer Maggi", category: "Maggi", description: "Double indulgence Maggi with fresh paneer & melted cheese.", images: [dishImageUrl("Cheese Paneer Maggi")], types: [{ label: "Full", price: 120 }], price: 120, isVeg: true },

  // 6. Chinese
  { _id: "chn_001", name: "Veg Noodles", category: "Chinese", description: "Stir-fried chow mein noodles with crisp vegetables.", images: [dishImageUrl("Veg Noodles")], types: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }], isVeg: true },
  { _id: "chn_002", name: "Hakka Noodles", category: "Chinese", description: "Indo-Chinese style savory hakka noodles with veggies.", images: [dishImageUrl("Hakka Noodles")], types: [{ label: "Half", price: 80 }, { label: "Full", price: 140 }], isVeg: true },
  { _id: "chn_003", name: "Schezwan Noodles", category: "Chinese", description: "Spicy Schezwan sauce tossed wok noodles.", images: [dishImageUrl("Schezwan Noodles")], types: [{ label: "Half", price: 80 }, { label: "Full", price: 150 }], isVeg: true },
  { _id: "chn_004", name: "Chilli Garlic Noodles", category: "Chinese", description: "Zesty noodles cooked with roasted garlic and red chilli flakes.", images: [dishImageUrl("Chilli Garlic Noodles")], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], isVeg: true },
  { _id: "chn_005", name: "Singapore Noodles", category: "Chinese", description: "Curry-flavored spicy noodles with exotic veggies.", images: [dishImageUrl("Singapore Noodles")], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], isVeg: true },
  { _id: "chn_006", name: "Paneer Chilli Dry", category: "Chinese", description: "Crispy paneer cubes tossed with capsicum, onion and soy sauce.", images: [dishImageUrl("Paneer Chilli Dry")], types: [{ label: "Half", price: 120 }, { label: "Full", price: 220 }], isVeg: true },
  { _id: "chn_007", name: "Paneer Chilli Gravy", category: "Chinese", description: "Soft paneer in a savory dark garlic soya gravy.", images: [dishImageUrl("Paneer Chilli Gravy")], types: [{ label: "Half", price: 130 }, { label: "Full", price: 230 }], isVeg: true },
  { _id: "chn_008", name: "Veg Manchurian", category: "Chinese", description: "Fried vegetable balls tossed in tangy Manchurian sauce.", images: [dishImageUrl("Veg Manchurian")], types: [{ label: "Half", price: 90 }, { label: "Full", price: 170 }], isVeg: true },
  { _id: "chn_009", name: "Paneer Manchurian", category: "Chinese", description: "Cottage cheese bites in spicy garlic ginger Manchurian gravy.", images: [dishImageUrl("Paneer Manchurian")], types: [{ label: "Half", price: 120 }, { label: "Full", price: 220 }], isVeg: true },
  { _id: "chn_010", name: "Chilli Potato", category: "Chinese", description: "Crispy potato wedges coated in sweet chilli soy glaze.", images: [dishImageUrl("Chilli Potato")], types: [{ label: "Half", price: 70 }, { label: "Full", price: 130 }], isVeg: true },
  { _id: "chn_011", name: "Honey Chilli Potato", category: "Chinese", description: "Golden fried potato fingers coated in honey chilli sauce and sesame.", images: [dishImageUrl("Honey Chilli Potato")], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], isVeg: true },
  { _id: "chn_012", name: "French Fries", category: "Chinese", description: "Crispy salted potato fries served with ketchup.", images: [dishImageUrl("French Fries")], types: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }], isVeg: true },
  { _id: "chn_013", name: "Veg Fried Rice", category: "Chinese", description: "Wok-fried rice with finely chopped garden vegetables.", images: [dishImageUrl("Veg Fried Rice")], types: [{ label: "Half", price: 70 }, { label: "Full", price: 130 }], isVeg: true },
  { _id: "chn_014", name: "Paneer Fried Rice", category: "Chinese", description: "Aromatic fried rice studded with paneer cubes.", images: [dishImageUrl("Paneer Fried Rice")], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], isVeg: true },
  { _id: "chn_015", name: "Mushroom Fried Rice", category: "Chinese", description: "Delicious wok rice cooked with button mushrooms and spring onion.", images: [dishImageUrl("Mushroom Fried Rice")], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], isVeg: true },

  // 7. Pasta
  { _id: "pas_001", name: "Red Sauce Pasta", category: "Pasta", description: "Penne pasta in tangy tomato basil sauce.", images: [dishImageUrl("Red Sauce Pasta")], types: [{ label: "Full", price: 90 }], price: 90, isVeg: true },
  { _id: "pas_002", name: "White Sauce Pasta", category: "Pasta", description: "Rich creamy Alfredo pasta cooked with cheese & herbs.", images: [dishImageUrl("White Sauce Pasta")], types: [{ label: "Full", price: 110 }], price: 110, isVeg: true },
  { _id: "pas_003", name: "Veg Pasta", category: "Pasta", description: "Delicious penne pasta tossed with fresh veggies.", images: [dishImageUrl("Veg Pasta")], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },

  // 8. Rice & Biryani
  { _id: "bir_001", name: "Plain Rice", category: "Rice & Biryani", description: "Steamed long-grain basmati rice.", images: [dishImageUrl("Plain Rice")], types: [{ label: "Full", price: 50 }], price: 50, isVeg: true },
  { _id: "bir_002", name: "Zeera Rice", category: "Rice & Biryani", description: "Aromatic rice tempered with cumin seeds and ghee.", images: [dishImageUrl("Zeera Rice")], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "bir_003", name: "Matar Pulao", category: "Rice & Biryani", description: "Fragrant rice dish cooked with tender green peas.", images: [dishImageUrl("Matar Pulao")], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "bir_004", name: "Veg Pulao", category: "Rice & Biryani", description: "Seasoned basmati rice cooked with assorted vegetables.", images: [dishImageUrl("Veg Pulao")], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "bir_005", name: "Veg Biryani", category: "Rice & Biryani", description: "Slow-cooked dum biryani layered with marinated vegetables.", images: [dishImageUrl("Veg Biryani")], types: [{ label: "Full", price: 80 }], price: 80, bestseller: true, isVeg: true },
  { _id: "bir_006", name: "Chicken Biryani", category: "Rice & Biryani", description: "Hyderabadi style dum biryani with tender chicken pieces.", images: [dishImageUrl("Chicken Biryani")], types: [{ label: "Half", price: 120 }, { label: "Full", price: 220 }], isVeg: false },
  { _id: "bir_007", name: "Mutton Biryani", category: "Rice & Biryani", description: "Rich aromatic mutton biryani cooked with authentic spices.", images: [dishImageUrl("Mutton Biryani")], types: [{ label: "Half", price: 180 }, { label: "Full", price: 340 }], isVeg: false },
  { _id: "bir_008", name: "Egg Biryani", category: "Rice & Biryani", description: "Flavored biryani rice served with boiled spicy eggs.", images: [dishImageUrl("Egg Biryani")], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], isVeg: false },

  // 9. Burgers
  { _id: "brg_001", name: "Veg Burger", category: "Burgers", description: "Crispy veggie patty with lettuce & mayo.", images: [dishImageUrl("Veg Burger")], types: [{ label: "Full", price: 50 }], price: 50, isVeg: true },
  { _id: "brg_002", name: "Paneer Burger", category: "Burgers", description: "Grilled paneer patty burger loaded with special sauce.", images: [dishImageUrl("Paneer Burger")], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "brg_003", name: "Double Tikki Burger", category: "Burgers", description: "Stacked double potato patties with extra crunch.", images: [dishImageUrl("Double Tikki Burger")], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "brg_004", name: "Cheese Burger", category: "Burgers", description: "Juicy burger topped with melted cheese slice.", images: [dishImageUrl("Cheese Burger")], types: [{ label: "Full", price: 90 }], price: 90, isVeg: true },

  // 10. Sweets
  { _id: "swt_001", name: "Gulab Jamun", category: "Sweets", description: "Soft melt-in-mouth milk solid dumplings dipped in rose syrup.", images: [dishImageUrl("Gulab Jamun")], types: [{ label: "Full", price: 30 }], price: 30, isVeg: true },
  { _id: "swt_002", name: "Fruit Custard", category: "Sweets", description: "Chilled sweet vanilla custard loaded with fresh fruits.", images: [dishImageUrl("Fruit Custard")], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },

  // 11. Dal
  { _id: "dal_001", name: "Dal Fry", category: "Dal", description: "Yellow lentils cooked with onion, tomato and spices.", images: [dishImageUrl("Dal Fry")], types: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }], isVeg: true },
  { _id: "dal_002", name: "Dal Tadka", category: "Dal", description: "Arhar dal tempered with garlic, cumin, and red chilli in desi ghee.", images: [dishImageUrl("Dal Tadka")], types: [{ label: "Half", price: 70 }, { label: "Full", price: 130 }], isVeg: true },
  { _id: "dal_003", name: "Dal Makhani", category: "Dal", description: "Slow-cooked black lentils simmered in butter and cream.", images: [dishImageUrl("Dal Makhani")], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], isVeg: true },

  // 12. Main Course
  { _id: "main_001", name: "Matar Paneer", category: "Main Course", description: "Paneer cubes and green peas in spiced tomato gravy.", images: [dishImageUrl("Matar Paneer")], types: [{ label: "Half", price: 110 }, { label: "Full", price: 200 }], isVeg: true },
  { _id: "main_002", name: "Shahi Paneer", category: "Main Course", description: "Rich & creamy royal cottage cheese in cashew tomato gravy.", images: [dishImageUrl("Shahi Paneer")], types: [{ label: "Half", price: 130 }, { label: "Full", price: 240 }], bestseller: true, isVeg: true },
  { _id: "main_003", name: "Handi Paneer", category: "Main Course", description: "Traditional clay-pot cooked paneer in thick gravy.", images: [dishImageUrl("Handi Paneer")], types: [{ label: "Half", price: 140 }, { label: "Full", price: 260 }], isVeg: true },
  { _id: "main_004", name: "Kadai Paneer", category: "Main Course", description: "Paneer cooked with capsicum and fresh Kadai masala.", images: [dishImageUrl("Kadai Paneer")], types: [{ label: "Half", price: 130 }, { label: "Full", price: 240 }], isVeg: true },
  { _id: "main_005", name: "Paneer Do Pyaza", category: "Main Course", description: "Delicious paneer curry loaded with sauteed onions.", images: [dishImageUrl("Paneer Do Pyaza")], types: [{ label: "Half", price: 130 }, { label: "Full", price: 240 }], isVeg: true },
  { _id: "main_006", name: "Paneer Butter Masala", category: "Main Course", description: "Soft paneer in rich buttery tomato butter gravy.", images: [dishImageUrl("Paneer Butter Masala")], types: [{ label: "Half", price: 140 }, { label: "Full", price: 260 }], isVeg: true },
  { _id: "main_007", name: "Paneer Lababdar", category: "Main Course", description: "Creamy grated and cubed paneer in aromatic gravy.", images: [dishImageUrl("Paneer Lababdar")], types: [{ label: "Half", price: 140 }, { label: "Full", price: 260 }], isVeg: true },
  { _id: "main_008", name: "Aloo Jeera", category: "Main Course", description: "Sauteed potatoes tossed with cumin seeds and coriander.", images: [dishImageUrl("Aloo Jeera")], types: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }], isVeg: true },
  { _id: "main_009", name: "Mix Veg", category: "Main Course", description: "Assorted seasonal vegetables cooked in onion masala gravy.", images: [dishImageUrl("Mix Veg")], types: [{ label: "Half", price: 80 }, { label: "Full", price: 150 }], isVeg: true },
  { _id: "main_010", name: "Mushroom Masala", category: "Main Course", description: "Button mushrooms simmered in spicy onion tomato gravy.", images: [dishImageUrl("Mushroom Masala")], types: [{ label: "Half", price: 130 }, { label: "Full", price: 240 }], isVeg: true },

  // 13. Roti & Papad
  { _id: "rt_001", name: "Plain Tawa Roti", category: "Roti & Papad", description: "Freshly prepared thin wheat flatbread.", images: [dishImageUrl("Plain Tawa Roti")], types: [{ label: "Full", price: 8 }], price: 8, isVeg: true },
  { _id: "rt_002", name: "Butter Tawa Roti", category: "Roti & Papad", description: "Fresh tawa roti brushed with fresh butter.", images: [dishImageUrl("Butter Tawa Roti")], types: [{ label: "Full", price: 12 }], price: 12, isVeg: true },
  { _id: "rt_003", name: "Ghee Tawa Roti", category: "Roti & Papad", description: "Hot tawa roti brushed with pure desi ghee.", images: [dishImageUrl("Ghee Tawa Roti")], types: [{ label: "Full", price: 15 }], price: 15, isVeg: true },
  { _id: "rt_004", name: "Tandoori Roti", category: "Roti & Papad", description: "Clay oven roasted traditional Indian bread.", images: [dishImageUrl("Tandoori Roti")], types: [{ label: "Full", price: 20 }], price: 20, isVeg: true },
  { _id: "rt_005", name: "Laccha Paratha", category: "Roti & Papad", description: "Multi-layered crispy tandoori paratha.", images: [dishImageUrl("Laccha Paratha")], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "rt_006", name: "Nan Roti", category: "Roti & Papad", description: "Soft leavened tandoori naan.", images: [dishImageUrl("Nan Roti")], types: [{ label: "Full", price: 50 }], price: 50, isVeg: true },
  { _id: "rt_007", name: "Butter Nan Roti", category: "Roti & Papad", description: "Leavened tandoori naan brushed with rich butter.", images: [dishImageUrl("Butter Nan Roti")], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "rt_008", name: "Dry Papad", category: "Roti & Papad", description: "Roasted crispy lentil papad.", images: [dishImageUrl("Dry Papad")], types: [{ label: "Full", price: 10 }], price: 10, isVeg: true },
  { _id: "rt_009", name: "Fry Papad", category: "Roti & Papad", description: "Deep-fried crispy papad.", images: [dishImageUrl("Fry Papad")], types: [{ label: "Full", price: 12 }], price: 12, isVeg: true },

  // 14. Pizza
  { _id: "piz_001", name: "Margrita Pizza", category: "Pizza", description: "Classic cheese pizza topped with mozzarella and herbs.", images: [dishImageUrl("Margherita Pizza")], types: [{ label: "Half", price: 99 }, { label: "Full", price: 149 }], isVeg: true },
  { _id: "piz_002", name: "Mix Veg Pizza", category: "Pizza", description: "Topped with onion, capsicum, tomato and sweet corn.", images: [dishImageUrl("Mix Veg Pizza")], types: [{ label: "Half", price: 129 }, { label: "Full", price: 189 }], isVeg: true },
  { _id: "piz_003", name: "Paneer Tikka Pizza", category: "Pizza", description: "Loaded with tandoori paneer tikka, capsicum & cheese.", images: [dishImageUrl("Paneer Tikka Pizza")], types: [{ label: "Half", price: 149 }, { label: "Full", price: 219 }], isVeg: true },
  { _id: "piz_004", name: "Sweet Corn Pizza", category: "Pizza", description: "Golden sweet corn and melted mozzarella cheese.", images: [dishImageUrl("Sweet Corn Pizza")], types: [{ label: "Half", price: 119 }, { label: "Full", price: 199 }], isVeg: true },
  { _id: "piz_005", name: "Onion Pizza", category: "Pizza", description: "Simple delight topped with crunchy onions and cheese.", images: [dishImageUrl("Onion Pizza")], types: [{ label: "Half", price: 99 }, { label: "Full", price: 149 }], isVeg: true },
  { _id: "piz_006", name: "Double Cheese Pizza", category: "Pizza", description: "Overloaded with extra mozzarella cheese.", images: [dishImageUrl("Double Cheese Pizza")], types: [{ label: "Half", price: 169 }, { label: "Full", price: 249 }], isVeg: true },
  { _id: "piz_007", name: "Green House Pizza", category: "Pizza", description: "Capsicum, green chilli, jalapeno & herbs pizza.", images: [dishImageUrl("Green House Pizza")], types: [{ label: "Half", price: 149 }, { label: "Full", price: 249 }], isVeg: true },

  // 15. Thali
  { _id: "thl_001", name: "Super Deluxe Thali", category: "Thali", description: "Complete feast with Paneer dish, Dal Makhani, Mix Veg, Pulao, 2 Butter Naan, Sweet & Salad.", images: [dishImageUrl("Super Deluxe Thali")], types: [{ label: "Full", price: 250 }], price: 250, bestseller: true, isVeg: true },
  { _id: "thl_002", name: "Deluxe Thali", category: "Thali", description: "Paneer Dish, Dal Fry, Jeera Rice, 4 Roti, Sweet & Salad.", images: [dishImageUrl("Deluxe Thali")], types: [{ label: "Full", price: 140 }], price: 140, isVeg: true },
  { _id: "thl_003", name: "Regular Thali", category: "Thali", description: "Seasonal Veg, Dal, Rice, 4 Tawa Roti & Salad.", images: [dishImageUrl("Regular Thali")], types: [{ label: "Full", price: 100 }], price: 100, isVeg: true },
];
