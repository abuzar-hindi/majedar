const dishImageUrl = (dishName) => {
  const searchTerms = dishName.toLowerCase().replace(/[^a-z0-9]+/g, ",");
  const lock = [...dishName].reduce(
    (total, character) => (total * 31 + character.charCodeAt(0)) % 100000,
    7
  );

  return `https://loremflickr.com/640/480/${searchTerms},food?lock=${lock}`;
};

const p_img1 = dishImageUrl("Aloo Poha");
const p_img2 = dishImageUrl("Paneer Pakoda");
const p_img3 = dishImageUrl("Aloo Paratha");
const p_img4 = dishImageUrl("Paneer Paratha");
const p_img5 = dishImageUrl("Aloo Gobhi Paratha");
const p_img6 = dishImageUrl("Chola Bhatura");
const p_img7 = dishImageUrl("Chola Puri");
const p_img8 = dishImageUrl("Chola Chawal");
const p_img9 = dishImageUrl("Idli Sambhar");
const p_img10 = dishImageUrl("Plain Dosa");
const p_img11 = dishImageUrl("Masala Dosa");
const p_img12 = dishImageUrl("Butter Masala Dosa");
const p_img13 = dishImageUrl("Milk Tea");
const p_img14 = dishImageUrl("Masala Tea");
const p_img15 = dishImageUrl("Black Tea");
const p_img16 = dishImageUrl("Hot Coffee");
const p_img17 = dishImageUrl("Cold Coffee");
const p_img18 = dishImageUrl("Steam Momos");
const p_img19 = dishImageUrl("Veg Fry Momos");
const p_img20 = dishImageUrl("Tandoori Momos");
const p_img21 = dishImageUrl("Veg Maggi");
const p_img22 = dishImageUrl("Paneer Maggi");
const p_img23 = dishImageUrl("Cheese Maggi");
const p_img24 = dishImageUrl("Cheese Paneer Maggi");
const p_img25 = dishImageUrl("Veg Noodles");
const p_img26 = dishImageUrl("Hakka Noodles");
const p_img27 = dishImageUrl("Schezwan Noodles");
const p_img28 = dishImageUrl("Chilli Garlic Noodles");
const p_img29 = dishImageUrl("Singapore Noodles");
const p_img30 = dishImageUrl("Paneer Chilli Dry");
const p_img31 = dishImageUrl("Paneer Chilli Gravy");
const p_img32 = dishImageUrl("Veg Manchurian");
const p_img33 = dishImageUrl("Paneer Manchurian");
const p_img34 = dishImageUrl("Chilli Potato");
const p_img35 = dishImageUrl("Honey Chilli Potato");
const p_img36 = dishImageUrl("French Fries");
const p_img37 = dishImageUrl("Veg Fried Rice");
const p_img38 = dishImageUrl("Paneer Fried Rice");
const p_img39 = dishImageUrl("Mushroom Fried Rice");
const p_img40 = dishImageUrl("Red Sauce Pasta");
const p_img41 = dishImageUrl("White Sauce Pasta");
const p_img42 = dishImageUrl("Veg Pasta");
const p_img43 = dishImageUrl("Plain Rice");
const p_img44 = dishImageUrl("Zeera Rice");
const p_img45 = dishImageUrl("Matar Pulao");
const p_img46 = dishImageUrl("Veg Pulao");
const p_img47 = dishImageUrl("Veg Biryani");
const p_img48 = dishImageUrl("Chicken Biryani");
const p_img49 = dishImageUrl("Mutton Biryani");
const p_img50 = dishImageUrl("Egg Biryani");
const p_img51 = dishImageUrl("Veg Burger");
const p_img52 = dishImageUrl("Paneer Burger");
const p_img53 = dishImageUrl("Double Tikki Burger");
const p_img54 = dishImageUrl("Cheese Burger");
const p_img55 = dishImageUrl("Gulab Jamun");
const p_img56 = dishImageUrl("Fruit Custard");
const p_img57 = dishImageUrl("Dal Fry");
const p_img58 = dishImageUrl("Dal Tadka");
const p_img59 = dishImageUrl("Dal Makhani");
const p_img60 = dishImageUrl("Matar Paneer");
const p_img61 = dishImageUrl("Shahi Paneer");
const p_img62 = dishImageUrl("Handi Paneer");
const p_img63 = dishImageUrl("Kadai Paneer");
const p_img64 = dishImageUrl("Paneer Do Pyaza");
const p_img65 = dishImageUrl("Paneer Butter Masala");
const p_img66 = dishImageUrl("Paneer Lababdar");
const p_img67 = dishImageUrl("Aloo Jeera");
const p_img68 = dishImageUrl("Mix Veg");
const p_img69 = dishImageUrl("Mushroom Masala");
const p_img70 = dishImageUrl("Plain Tawa Roti");
const p_img71 = dishImageUrl("Butter Tawa Roti");
const p_img72 = dishImageUrl("Ghee Tawa Roti");
const p_img73 = dishImageUrl("Tandoori Roti");
const p_img74 = dishImageUrl("Laccha Paratha");
const p_img75 = dishImageUrl("Nan Roti");
const p_img76 = dishImageUrl("Butter Nan Roti");
const p_img77 = dishImageUrl("Dry Papad");
const p_img78 = dishImageUrl("Fry Papad");
const p_img79 = dishImageUrl("Margherita Pizza");
const p_img80 = dishImageUrl("Mix Veg Pizza");
const p_img81 = dishImageUrl("Paneer Tikka Pizza");
const p_img82 = dishImageUrl("Sweet Corn Pizza");
const p_img83 = dishImageUrl("Onion Pizza");
const p_img84 = dishImageUrl("Double Cheese Pizza");
const p_img85 = dishImageUrl("Green House Pizza");
const p_img86 = dishImageUrl("Super Deluxe Thali");
const p_img87 = dishImageUrl("Deluxe Thali");
const p_img88 = dishImageUrl("Regular Thali");

import google_pay from "./google-pay.png";
import PhonePe from "./PhonePe.webp";
import cart_icon from "./cart_icon.png";
import bin_icon from "./bin_icon.png";
import dropdown_icon from "./dropdown_icon.png";
import profile_icon from "./profile_icon.png";
import quality_icon from "./quality_icon.png";
import search_icon from "./search_icon.png";
import star_dull_icon from "./star_dull_icon.png";
import star_icon from "./star_icon.png";
import support_img from "./support_img.png";
import menu_icon from "./menu_icon.png";
import contact_img from "./contact_img.png";
import cross_icon from "./cross_icon.png";

export const assets = {
  google_pay,
  PhonePe,
  cart_icon,
  dropdown_icon,
  profile_icon,
  quality_icon,
  search_icon,
  star_dull_icon,
  star_icon,
  bin_icon,
  support_img,
  menu_icon,  
  contact_img,
  cross_icon,
};

export const products = [
  // 1. Breakfast
  { _id: "brk_001", name: "Aloo Poha", category: "Breakfast", description: "Light flattened rice cooked with seasoned potatoes, mustard seeds & spices.", images: [p_img1], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "brk_002", name: "Paneer Pakoda", category: "Breakfast", description: "Crispy fried cottage cheese fritters served hot.", images: [p_img2], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "brk_003", name: "Aloo Paratha", category: "Breakfast", description: "Whole wheat stuffed flatbread filled with spiced mashed potatoes.", images: [p_img3], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "brk_004", name: "Paneer Paratha", category: "Breakfast", description: "Fresh paneer stuffed flatbread with Indian herbs.", images: [p_img4], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "brk_005", name: "Aloo Gobhi Paratha", category: "Breakfast", description: "Spiced potato and cauliflower stuffed griddled paratha.", images: [p_img5], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "brk_006", name: "Chola Bhatura", category: "Breakfast", description: "Spicy chickpea curry paired with fluffy deep-fried bhature.", images: [p_img6], types: [{ label: "Full", price: 70 }], price: 70, bestseller: true, isVeg: true },
  { _id: "brk_007", name: "Chola Puri", category: "Breakfast", description: "Aromatic chola served with puffed golden puris.", images: [p_img7], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "brk_008", name: "Chola Chawal", category: "Breakfast", description: "Classic North Indian comfort meal of spiced chole with steamed rice.", images: [p_img8], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },

  // 2. South Indian
  { _id: "sth_001", name: "Idli Sambhar", category: "South Indian", description: "Steamed rice cakes served with hot lentil sambhar & chutney.", images: [p_img9], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "sth_002", name: "Plain Dosa", category: "South Indian", description: "Crispy golden fermented crepe served with sambhar and chutneys.", images: [p_img10], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "sth_003", name: "Masala Dosa", category: "South Indian", description: "Crisp dosa filled with spiced potato masala.", images: [p_img11], types: [{ label: "Full", price: 110 }], price: 110, bestseller: true, isVeg: true },
  { _id: "sth_004", name: "Butter Masala Dosa", category: "South Indian", description: "Rich butter-crusted dosa stuffed with savory potato masala.", images: [p_img12], types: [{ label: "Full", price: 130 }], price: 130, isVeg: true },

  // 3. Tea & Coffee
  { _id: "tea_001", name: "Milk Tea", category: "Tea & Coffee", description: "Traditional hot brewed chai with milk and cardamom.", images: [p_img13], types: [{ label: "Full", price: 20 }], price: 20, isVeg: true },
  { _id: "tea_002", name: "Masala Tea", category: "Tea & Coffee", description: "Aromatic tea infused with fresh ginger and mixed spices.", images: [p_img14], types: [{ label: "Full", price: 25 }], price: 25, isVeg: true },
  { _id: "tea_003", name: "Black Tea", category: "Tea & Coffee", description: "Refreshing clear hot black tea.", images: [p_img15], types: [{ label: "Full", price: 30 }], price: 30, isVeg: true },
  { _id: "tea_004", name: "Hot Coffee", category: "Tea & Coffee", description: "Freshly whipped rich hot coffee.", images: [p_img16], types: [{ label: "Full", price: 40 }], price: 40, isVeg: true },
  { _id: "tea_005", name: "Cold Coffee", category: "Tea & Coffee", description: "Chilled creamy blended coffee topped with chocolate powder.", images: [p_img17], types: [{ label: "Full", price: 110 }], price: 110, isVeg: true },

  // 4. Momos
  { _id: "mom_001", name: "Steam Momos", category: "Momos", description: "Soft steamed vegetable dumplings with spicy red dip.", images: [p_img18], types: [{ label: "Full", price: 60 }], price: 60, bestseller: true, isVeg: true },
  { _id: "mom_002", name: "Veg Fry Momos", category: "Momos", description: "Golden pan-fried momos filled with seasoned veggies.", images: [p_img19], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "mom_003", name: "Tandoori Momos", category: "Momos", description: "Charcoal-tossed smoked momos marinated in tandoori masala.", images: [p_img20], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },

  // 5. Maggi
  { _id: "mag_001", name: "Veg Maggi", category: "Maggi", description: "Classic street-style noodles tossed with green veggies.", images: [p_img21], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "mag_002", name: "Paneer Maggi", category: "Maggi", description: "Maggi noodles loaded with soft paneer cubes.", images: [p_img22], types: [{ label: "Full", price: 90 }], price: 90, isVeg: true },
  { _id: "mag_003", name: "Cheese Maggi", category: "Maggi", description: "Creamy melted cheese infused instant noodles.", images: [p_img23], types: [{ label: "Full", price: 100 }], price: 100, isVeg: true },
  { _id: "mag_004", name: "Cheese Paneer Maggi", category: "Maggi", description: "Double indulgence Maggi with fresh paneer & melted cheese.", images: [p_img24], types: [{ label: "Full", price: 120 }], price: 120, isVeg: true },

  // 6. Chinese
  { _id: "chn_001", name: "Veg Noodles", category: "Chinese", description: "Stir-fried chow mein noodles with crisp vegetables.", images: [p_img25], types: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }], priceHalf: 60, priceFull: 110, isVeg: true },
  { _id: "chn_002", name: "Hakka Noodles", category: "Chinese", description: "Indo-Chinese style savory hakka noodles with veggies.", images: [p_img26], types: [{ label: "Half", price: 80 }, { label: "Full", price: 140 }], priceHalf: 80, priceFull: 140, isVeg: true },
  { _id: "chn_003", name: "Schezwan Noodles", category: "Chinese", description: "Spicy Schezwan sauce tossed wok noodles.", images: [p_img27], types: [{ label: "Half", price: 80 }, { label: "Full", price: 150 }], priceHalf: 80, priceFull: 150, isVeg: true },
  { _id: "chn_004", name: "Chilli Garlic Noodles", category: "Chinese", description: "Zesty noodles cooked with roasted garlic and red chilli flakes.", images: [p_img28], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], priceHalf: 90, priceFull: 160, isVeg: true },
  { _id: "chn_005", name: "Singapore Noodles", category: "Chinese", description: "Curry-flavored spicy noodles with exotic veggies.", images: [p_img29], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], priceHalf: 90, priceFull: 160, isVeg: true },
  { _id: "chn_006", name: "Paneer Chilli Dry", category: "Chinese", description: "Crispy paneer cubes tossed with capsicum, onion and soy sauce.", images: [p_img30], types: [{ label: "Half", price: 120 }, { label: "Full", price: 220 }], priceHalf: 120, priceFull: 220, isVeg: true },
  { _id: "chn_007", name: "Paneer Chilli Gravy", category: "Chinese", description: "Soft paneer in a savory dark garlic soya gravy.", images: [p_img31], types: [{ label: "Half", price: 130 }, { label: "Full", price: 230 }], priceHalf: 130, priceFull: 230, isVeg: true },
  { _id: "chn_008", name: "Veg Manchurian", category: "Chinese", description: "Fried vegetable balls tossed in tangy Manchurian sauce.", images: [p_img32], types: [{ label: "Half", price: 90 }, { label: "Full", price: 170 }], priceHalf: 90, priceFull: 170, isVeg: true },
  { _id: "chn_009", name: "Paneer Manchurian", category: "Chinese", description: "Cottage cheese bites in spicy garlic ginger Manchurian gravy.", images: [p_img33], types: [{ label: "Half", price: 120 }, { label: "Full", price: 220 }], priceHalf: 120, priceFull: 220, isVeg: true },
  { _id: "chn_010", name: "Chilli Potato", category: "Chinese", description: "Crispy potato wedges coated in sweet chilli soy glaze.", images: [p_img34], types: [{ label: "Half", price: 70 }, { label: "Full", price: 130 }], priceHalf: 70, priceFull: 130, isVeg: true },
  { _id: "chn_011", name: "Honey Chilli Potato", category: "Chinese", description: "Golden fried potato fingers coated in honey chilli sauce and sesame.", images: [p_img35], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], priceHalf: 90, priceFull: 160, isVeg: true },
  { _id: "chn_012", name: "French Fries", category: "Chinese", description: "Crispy salted potato fries served with ketchup.", images: [p_img36], types: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }], priceHalf: 60, priceFull: 110, isVeg: true },
  { _id: "chn_013", name: "Veg Fried Rice", category: "Chinese", description: "Wok-fried rice with finely chopped garden vegetables.", images: [p_img37], types: [{ label: "Half", price: 70 }, { label: "Full", price: 130 }], priceHalf: 70, priceFull: 130, isVeg: true },
  { _id: "chn_014", name: "Paneer Fried Rice", category: "Chinese", description: "Aromatic fried rice studded with paneer cubes.", images: [p_img38], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], priceHalf: 90, priceFull: 160, isVeg: true },
  { _id: "chn_015", name: "Mushroom Fried Rice", category: "Chinese", description: "Delicious wok rice cooked with button mushrooms and spring onion.", images: [p_img39], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], priceHalf: 90, priceFull: 160, isVeg: true },

  // 7. Pasta
  { _id: "pas_001", name: "Red Sauce Pasta", category: "Pasta", description: "Penne pasta in tangy tomato basil sauce.", images: [p_img40], types: [{ label: "Full", price: 90 }], price: 90, isVeg: true },
  { _id: "pas_002", name: "White Sauce Pasta", category: "Pasta", description: "Rich creamy Alfredo pasta cooked with cheese & herbs.", images: [p_img41], types: [{ label: "Full", price: 110 }], price: 110, isVeg: true },
  { _id: "pas_003", name: "Veg Pasta", category: "Pasta", description: "Delicious penne pasta tossed with fresh veggies.", images: [p_img42], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },

  // 8. Rice & Biryani
  { _id: "bir_001", name: "Plain Rice", category: "Rice & Biryani", description: "Steamed long-grain basmati rice.", images: [p_img43], types: [{ label: "Full", price: 50 }], price: 50, isVeg: true },
  { _id: "bir_002", name: "Zeera Rice", category: "Rice & Biryani", description: "Aromatic rice tempered with cumin seeds and ghee.", images: [p_img44], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "bir_003", name: "Matar Pulao", category: "Rice & Biryani", description: "Fragrant rice dish cooked with tender green peas.", images: [p_img45], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "bir_004", name: "Veg Pulao", category: "Rice & Biryani", description: "Seasoned basmati rice cooked with assorted vegetables.", images: [p_img46], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "bir_005", name: "Veg Biryani", category: "Rice & Biryani", description: "Slow-cooked dum biryani layered with marinated vegetables.", images: [p_img47], types: [{ label: "Full", price: 80 }], price: 80, bestseller: true, isVeg: true },
  { _id: "bir_006", name: "Chicken Biryani", category: "Rice & Biryani", description: "Hyderabadi style dum biryani with tender chicken pieces.", images: [p_img48], types: [{ label: "Half", price: 120 }, { label: "Full", price: 220 }], priceHalf: 120, priceFull: 220, isVeg: false },
  { _id: "bir_007", name: "Mutton Biryani", category: "Rice & Biryani", description: "Rich aromatic mutton biryani cooked with authentic spices.", images: [p_img49], types: [{ label: "Half", price: 180 }, { label: "Full", price: 340 }], priceHalf: 180, priceFull: 340, isVeg: false },
  { _id: "bir_008", name: "Egg Biryani", category: "Rice & Biryani", description: "Flavored biryani rice served with boiled spicy eggs.", images: [p_img50], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], priceHalf: 90, priceFull: 160, isVeg: false },

  // 9. Burgers
  { _id: "brg_001", name: "Veg Burger", category: "Burgers", description: "Crispy veggie patty with lettuce & mayo.", images: [p_img51], types: [{ label: "Full", price: 50 }], price: 50, isVeg: true },
  { _id: "brg_002", name: "Paneer Burger", category: "Burgers", description: "Grilled paneer patty burger loaded with special sauce.", images: [p_img52], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },
  { _id: "brg_003", name: "Double Tikki Burger", category: "Burgers", description: "Stacked double potato patties with extra crunch.", images: [p_img53], types: [{ label: "Full", price: 80 }], price: 80, isVeg: true },
  { _id: "brg_004", name: "Cheese Burger", category: "Burgers", description: "Juicy burger topped with melted cheese slice.", images: [p_img54], types: [{ label: "Full", price: 90 }], price: 90, isVeg: true },

  // 10. Sweets
  { _id: "swt_001", name: "Gulab Jamun", category: "Sweets", description: "Soft melt-in-mouth milk solid dumplings dipped in rose syrup.", images: [p_img55], types: [{ label: "Full", price: 30 }], price: 30, isVeg: true },
  { _id: "swt_002", name: "Fruit Custard", category: "Sweets", description: "Chilled sweet vanilla custard loaded with fresh fruits.", images: [p_img56], types: [{ label: "Full", price: 70 }], price: 70, isVeg: true },

  // 11. Dal
  { _id: "dal_001", name: "Dal Fry", category: "Dal", description: "Yellow lentils cooked with onion, tomato and spices.", images: [p_img57], types: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }], priceHalf: 60, priceFull: 110, isVeg: true },
  { _id: "dal_002", name: "Dal Tadka", category: "Dal", description: "Arhar dal tempered with garlic, cumin, and red chilli in desi ghee.", images: [p_img58], types: [{ label: "Half", price: 70 }, { label: "Full", price: 130 }], priceHalf: 70, priceFull: 130, isVeg: true },
  { _id: "dal_003", name: "Dal Makhani", category: "Dal", description: "Slow-cooked black lentils simmered in butter and cream.", images: [p_img59], types: [{ label: "Half", price: 90 }, { label: "Full", price: 160 }], priceHalf: 90, priceFull: 160, isVeg: true },

  // 12. Main Course
  { _id: "main_001", name: "Matar Paneer", category: "Main Course", description: "Paneer cubes and green peas in spiced tomato gravy.", images: [p_img60], types: [{ label: "Half", price: 110 }, { label: "Full", price: 200 }], priceHalf: 110, priceFull: 200, isVeg: true },
  { _id: "main_002", name: "Shahi Paneer", category: "Main Course", description: "Rich & creamy royal cottage cheese in cashew tomato gravy.", images: [p_img61], types: [{ label: "Half", price: 130 }, { label: "Full", price: 240 }], priceHalf: 130, priceFull: 240, bestseller: true, isVeg: true },
  { _id: "main_003", name: "Handi Paneer", category: "Main Course", description: "Traditional clay-pot cooked paneer in thick gravy.", images: [p_img62], types: [{ label: "Half", price: 140 }, { label: "Full", price: 260 }], priceHalf: 140, priceFull: 260, isVeg: true },
  { _id: "main_004", name: "Kadai Paneer", category: "Main Course", description: "Paneer cooked with capsicum and fresh Kadai masala.", images: [p_img63], types: [{ label: "Half", price: 130 }, { label: "Full", price: 240 }], priceHalf: 130, priceFull: 240, isVeg: true },
  { _id: "main_005", name: "Paneer Do Pyaza", category: "Main Course", description: "Delicious paneer curry loaded with sautéed onions.", images: [p_img64], types: [{ label: "Half", price: 130 }, { label: "Full", price: 240 }], priceHalf: 130, priceFull: 240, isVeg: true },
  { _id: "main_006", name: "Paneer Butter Masala", category: "Main Course", description: "Soft paneer in rich buttery tomato butter gravy.", images: [p_img65], types: [{ label: "Half", price: 140 }, { label: "Full", price: 260 }], priceHalf: 140, priceFull: 260, isVeg: true },
  { _id: "main_007", name: "Paneer Lababdar", category: "Main Course", description: "Creamy grated and cubed paneer in aromatic gravy.", images: [p_img66], types: [{ label: "Half", price: 140 }, { label: "Full", price: 260 }], priceHalf: 140, priceFull: 260, isVeg: true },
  { _id: "main_008", name: "Aloo Jeera", category: "Main Course", description: "Sautéed potatoes tossed with cumin seeds and coriander.", images: [p_img67], types: [{ label: "Half", price: 60 }, { label: "Full", price: 110 }], priceHalf: 60, priceFull: 110, isVeg: true },
  { _id: "main_009", name: "Mix Veg", category: "Main Course", description: "Assorted seasonal vegetables cooked in onion masala gravy.", images: [p_img68], types: [{ label: "Half", price: 80 }, { label: "Full", price: 150 }], priceHalf: 80, priceFull: 150, isVeg: true },
  { _id: "main_010", name: "Mushroom Masala", category: "Main Course", description: "Button mushrooms simmered in spicy onion tomato gravy.", images: [p_img69], types: [{ label: "Half", price: 130 }, { label: "Full", price: 240 }], priceHalf: 130, priceFull: 240, isVeg: true },

  // 13. Roti & Papad
  { _id: "rt_001", name: "Plain Tawa Roti", category: "Roti & Papad", description: "Freshly prepared thin wheat flatbread.", images: [p_img70], types: [{ label: "Full", price: 8 }], price: 8, isVeg: true },
  { _id: "rt_002", name: "Butter Tawa Roti", category: "Roti & Papad", description: "Fresh tawa roti brushed with fresh butter.", images: [p_img71], types: [{ label: "Full", price: 12 }], price: 12, isVeg: true },
  { _id: "rt_003", name: "Ghee Tawa Roti", category: "Roti & Papad", description: "Hot tawa roti brushed with pure desi ghee.", images: [p_img72], types: [{ label: "Full", price: 15 }], price: 15, isVeg: true },
  { _id: "rt_004", name: "Tandoori Roti", category: "Roti & Papad", description: "Clay oven roasted traditional Indian bread.", images: [p_img73], types: [{ label: "Full", price: 20 }], price: 20, isVeg: true },
  { _id: "rt_005", name: "Laccha Paratha", category: "Roti & Papad", description: "Multi-layered crispy tandoori paratha.", images: [p_img74], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "rt_006", name: "Nan Roti", category: "Roti & Papad", description: "Soft leavened tandoori naan.", images: [p_img75], types: [{ label: "Full", price: 50 }], price: 50, isVeg: true },
  { _id: "rt_007", name: "Butter Nan Roti", category: "Roti & Papad", description: "Leavened tandoori naan brushed with rich butter.", images: [p_img76], types: [{ label: "Full", price: 60 }], price: 60, isVeg: true },
  { _id: "rt_008", name: "Dry Papad", category: "Roti & Papad", description: "Roasted crispy lentil papad.", images: [p_img77], types: [{ label: "Full", price: 10 }], price: 10, isVeg: true },
  { _id: "rt_009", name: "Fry Papad", category: "Roti & Papad", description: "Deep-fried crispy papad.", images: [p_img78], types: [{ label: "Full", price: 12 }], price: 12, isVeg: true },

  // 14. Pizza
  { _id: "piz_001", name: "Margrita Pizza", category: "Pizza", description: "Classic cheese pizza topped with mozzarella and herbs.", images: [p_img79], types: [{ label: "Half", price: 99 }, { label: "Full", price: 149 }], priceHalf: 99, priceFull: 149, isVeg: true },
  { _id: "piz_002", name: "Mix Veg Pizza", category: "Pizza", description: "Topped with onion, capsicum, tomato and sweet corn.", images: [p_img80], types: [{ label: "Half", price: 129 }, { label: "Full", price: 189 }], priceHalf: 129, priceFull: 189, isVeg: true },
  { _id: "piz_003", name: "Paneer Tikka Pizza", category: "Pizza", description: "Loaded with tandoori paneer tikka, capsicum & cheese.", images: [p_img81], types: [{ label: "Half", price: 149 }, { label: "Full", price: 219 }], priceHalf: 149, priceFull: 219, isVeg: true },
  { _id: "piz_004", name: "Sweet Corn Pizza", category: "Pizza", description: "Golden sweet corn and melted mozzarella cheese.", images: [p_img82], types: [{ label: "Half", price: 119 }, { label: "Full", price: 199 }], priceHalf: 119, priceFull: 199, isVeg: true },
  { _id: "piz_005", name: "Onion Pizza", category: "Pizza", description: "Simple delight topped with crunchy onions and cheese.", images: [p_img83], types: [{ label: "Half", price: 99 }, { label: "Full", price: 149 }], priceHalf: 99, priceFull: 149, isVeg: true },
  { _id: "piz_006", name: "Double Cheese Pizza", category: "Pizza", description: "Overloaded with extra mozzarella cheese.", images: [p_img84], types: [{ label: "Half", price: 169 }, { label: "Full", price: 249 }], priceHalf: 169, priceFull: 249, isVeg: true },
  { _id: "piz_007", name: "Green House Pizza", category: "Pizza", description: "Capsicum, green chilli, jalapeno & herbs pizza.", images: [p_img85], types: [{ label: "Half", price: 149 }, { label: "Full", price: 249 }], priceHalf: 149, priceFull: 249, isVeg: true },

  // 15. Thali
  { _id: "thl_001", name: "Super Deluxe Thali", category: "Thali", description: "Complete feast with Paneer dish, Dal Makhani, Mix Veg, Pulao, 2 Butter Naan, Sweet & Salad.", images: [p_img86], types: [{ label: "Full", price: 250 }], price: 250, bestseller: true, isVeg: true },
  { _id: "thl_002", name: "Deluxe Thali", category: "Thali", description: "Paneer Dish, Dal Fry, Jeera Rice, 4 Roti, Sweet & Salad.", images: [p_img87], types: [{ label: "Full", price: 140 }], price: 140, isVeg: true },
  { _id: "thl_003", name: "Regular Thali", category: "Thali", description: "Seasonal Veg, Dal, Rice, 4 Tawa Roti & Salad.", images: [p_img88], types: [{ label: "Full", price: 100 }], price: 100, isVeg: true },
];
