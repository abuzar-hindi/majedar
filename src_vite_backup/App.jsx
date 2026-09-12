import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import OrderAndDine from "./pages/OrderAndDine";
import Contact from "./pages/Contact";
import Orders from "./pages/Orders";
import PlaceOrder from "./pages/PlaceOrder";
import Product from "./pages/Product";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Searchbar from "./components/Searchbar";
import StickyCartBar from "./components/StickyCartBar";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReserveTable from "./components/ReserveTable";
import ScrollToTop from "./components/ScrollToTop";

const App = () => {
  return (
    <div className="bg-[#FAF8F5] min-h-screen text-stone-900 font-sans overflow-x-hidden antialiased flex flex-col justify-between">
      <div>
        <ToastContainer position="bottom-right" />
        <ScrollToTop />
        <Navbar />
        <Searchbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/orderanddine" element={<OrderAndDine />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/product/:productId" element={<Product />} />
          <Route path="/reserve-table" element={<ReserveTable />} />
        </Routes>
      </div>
      <StickyCartBar />
      <Footer />
    </div>
  );
};

export default App;
