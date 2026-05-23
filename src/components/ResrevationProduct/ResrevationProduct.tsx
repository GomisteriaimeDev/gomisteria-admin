import React, { useState } from "react";
import "./ResrevationProduct.scss";

import capitalize from "../../utils/Capitalize";
import BlueButton from "../BlueButton/BlueButton";
import ReservationModal from "../ReservationModal/ReservationModal";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
const ResrevationProduct = ({
  productData,
  productNgarkesaId,
  ngarkesaId,
}: any) => {
  const [isModalOpen, setModalOpen] = useState(false);
  const [quantity, setQuanitity] = useState(0);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const {currentUser} = useAuth()
  const toggleModal = () => setModalOpen(!isModalOpen);
  const handleDecrement = () => {
    if (productData?.category === "aksesore") {
      if (quantity > 1) {
        setQuanitity(quantity - 1);
      }
    } else {
      if (quantity > 4) {
        setQuanitity(quantity - 4);
      }
    }
  };

  const handleIncrement = () => {
    if (productData?.category === "aksesore") {
      setQuanitity(quantity + 1);
    } else {
      setQuanitity(quantity + 4);
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();

    const dataToSend = {
      ngarkesaId: ngarkesaId,
      quantity,
      userId:currentUser.id,
      productNgarkesaId: productNgarkesaId,
    };

    try {
      const response = await axios.post(
        "https://gomisteria-api.onrender.com/api/ngarkesa/preorder",

        dataToSend
      );

      navigate("/reservation/success");
    } catch (error) {
      console.error("Failed to submit form:", error);
    }
  };
  return (
    <div className="product-item">
      <a href={`/${productData?.category.toLowerCase()}/${productData?.id}`}>
        <img
          src={productData?.images[0]?.url}
          alt=""
          className="product-image"
        />
      </a>
      <div className="product-item-content">
        <div className="item-content-header">
          <h5>{productData?.name}</h5>
          <div className="item-content-text">
            <p>
              Marka: <span>{productData?.marka}</span>
            </p>
            <p>
              Kategoria: <span>{capitalize(productData?.category)}</span>
            </p>
          </div>
        </div>
        <div className="product-item-bottom">
          <h3>{productData?.price}€/copë</h3>
          <BlueButton
            productId={productData?.id}
            category={productData?.category}
            onClick={toggleModal}
          >
            Rezervo
          </BlueButton>
        </div>
      </div>
      <ReservationModal isOpen={isModalOpen} close={toggleModal}>
        <img
          src={productData?.images[0]?.url}
          alt=""
          className="productModalImage"
        />
        <div className="modal-details">
          <div className="product-modal-top">
            <h5 className="modal-product-title">{productData?.name}</h5>
            <div className="product-modal-text">
              <p>
                Marka: <span>{capitalize(productData.marka)}</span>
              </p>
              <p>
                Kategoria: <span>{capitalize(productData.category)}</span>
              </p>
            </div>
          </div>
          <div className="product-modal-bottom">
            <h3 className="modal-price">{productData?.price}€/copë</h3>
            <div className="product-box-counter">
              <p>Sasia: </p>
              <button onClick={handleDecrement}>-</button>
              <span>{quantity}</span>
              <button onClick={handleIncrement}>+</button>
            </div>
            <BlueButton
              productId={productData?.id}
              category={productData?.category}
              onClick={handleSubmit}
            >
              Rezervo
            </BlueButton>
          </div>
        </div>
      </ReservationModal>
    </div>
  );
};

export default ResrevationProduct;
