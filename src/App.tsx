import React from "react";

import "./App.scss";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/Login/Login";
import ProtectedRoute from "./utils/ProtectedRoute";
import RedirectIfAuthenticated from "./utils/RedirectIfAuth";
import Statistics from "./pages/Statistics/Statistics";
import Sales from "./pages/Sales/Sales";
import Products from "./pages/Products/Products";
import Businesses from "./pages/Businesses/Businesses";
import Services from "./pages/Services/Services";
import Preorders from "./pages/Preorders/Preorders";
import Ngarkesat from "./pages/Ngarkesat/Ngarkesat";
import Employees from "./pages/Employees/Employees";
import SalesDetails from "./pages/Sales/Details/SalesDetails";
import Approvim from "./pages/Businesses/Approvim/Approvim";
import CreateProduct from "./pages/Products/Create/CreateProduct";
import ProductDetails from "./pages/Products/Details/ProductDetails";
import NgarkesaDetails from "./pages/Ngarkesat/Details/NgarkesaDetails";
import CreateEmployee from "./pages/Employees/Create/CreateEmployee";
import EmployeeDetails from "./pages/Employees/Details/EmployeeDetails";
import PreorderDetails from "./pages/Preorders/Details/PreorderDetails";
import Settings from "./pages/Settings/Settings";
import Harte from "./pages/Businesses/Harte/Harte";
import HomepageCms from "./pages/Cms/HomepageCms";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route
          path="/"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />

        {/* <Route
          path="/"
          element={
            <RedirectIfAuthenticated>
              <IntroPage />
            </RedirectIfAuthenticated>
          }
        /> */}
        <Route element={<ProtectedRoute />}>
          <Route path="/statistics" element={<Statistics />} />
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/:id" element={<SalesDetails />} />
          <Route path="/products" element={<Products />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/products/create" element={<CreateProduct />} />
          <Route path="/services" element={<Services />} />
          <Route path="/businesses" element={<Businesses />} />
          <Route path="/businesses/map" element={<Harte />} />
          <Route path="/businesses/activate" element={<Approvim />} />
          <Route path="/reservations" element={<Preorders />} />
          <Route path="/reservations/:id" element={<PreorderDetails />} />
          <Route path="/loads" element={<Ngarkesat />} />
          <Route path="/loads/:id" element={<NgarkesaDetails />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetails />} />s
          <Route path="/employees/create" element={<CreateEmployee />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/cms" element={<HomepageCms />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;
