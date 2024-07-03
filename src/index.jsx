import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import "./output.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.jsx";
import OrderDetails from "./pages/OrderDetails.jsx";
import Book from "./pages/Customers/Book.jsx";
import { AuthProvider } from "./components/contexts/AuthContext.jsx";
import SuccessPage from "./pages/SuccessPage.jsx";
import PlaceOrder from "./pages/PlaceOrder.jsx";
import OrdersPage from "./pages/OrdersPage.jsx";
import VideoCall from "./components/common/VideoCall.jsx";


ReactDOM.createRoot(document.getElementById("root")).render(
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/order/details" element={<OrderDetails />} />
          <Route path="/order/book/:foodId" element={<Book />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/room/:roomId" element={<VideoCall />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
);
