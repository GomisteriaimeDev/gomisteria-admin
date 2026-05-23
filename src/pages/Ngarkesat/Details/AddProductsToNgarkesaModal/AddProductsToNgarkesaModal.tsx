import React, { ChangeEvent, useState } from "react";
import "./AddProductsToNgarkesaModal.scss";
import useFetchData, {
  addProductsToNgarkesa,
  getProducts,
} from "../../../../services/api";
import OutlineButton from "../../../../components/OutlineButton/OutlineButton";
import BlueButton from "../../../../components/BlueButton/BlueButton";

const AddProductsToNgarkesaModal = ({ isOpen, onClose, loadId }: any) => {
  const [selectedProducts, setSelectedProducts] = useState<any>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const { data: products } = useFetchData(getProducts, 1, 10000);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prevSelected: any) => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter((id: string) => id !== productId);
      } else {
        if (quantities[productId] === undefined) {
          setQuantities((prev) => ({ ...prev, [productId]: 1 }));
        }
        return [...prevSelected, productId];
      }
    });
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));
  };

  const incrementQuantity = (productId: string) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: (prevQuantities[productId] || 0) + 1,
    }));
  };

  const decrementQuantity = (productId: string) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: Math.max((prevQuantities[productId] || 0) - 1, 0),
    }));
  };
  const handleSubmit = async () => {
    try {
      const ngarkesaId = loadId;
      const productDetails = selectedProducts.map((productId: string) => ({
        productId,
        stock: quantities[productId] ?? 1,
      }));

      await addProductsToNgarkesa(ngarkesaId, productDetails);
      window.location.reload();
      onClose();
    } catch (error) {
      console.error("Error:", error);
    }
  };
  return (
    isOpen && (
      <div className="modal-overlay-ngarkesa">
        <div className="modal-content-ngarkesa">
          <div className="modal-header-ngarkesa">
            <h2>Shto Produkte</h2>
          </div>
          <div className="modal-body-ngarkesa">
            <div className="products-section-ngarkesa">
              <h3>Produktet</h3>
              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Produkt ID</th>
                    <th>Emri i Produktit</th>
                    <th>Marka</th>
                    <th>Çmimi</th>
                    <th style={{ width: "10px" }}>Sasia</th>
                  </tr>
                </thead>
                <tbody>
                  {products?.data?.map((product: any) => (
                    <tr key={product.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleProductSelect(product.id)}
                        />
                      </td>
                      <td>{product.serialNumber}</td>
                      <td>{product.name}</td>
                      <td>{product.marka}</td>
                      <td>{product.price}</td>
                      <td>
                        <div className="quantity-controls">
                          <button
                            type="button"
                            onClick={() => decrementQuantity(product.id)}
                            disabled={!selectedProducts.includes(product.id)}
                          >
                            -
                          </button>
                          <input
                            className="quantityInput"
                            type="number"
                            min="0"
                            value={quantities[product.id] || 0}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleQuantityChange(
                                product.id,
                                parseInt(e.target.value) || 0
                              )
                            }
                            disabled={!selectedProducts.includes(product.id)}
                          />
                          <button
                            type="button"
                            onClick={() => incrementQuantity(product.id)}
                            disabled={!selectedProducts.includes(product.id)}
                          >
                            +
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer-ngarkesa">
            <OutlineButton onClick={onClose}>Anulo</OutlineButton>
            <BlueButton onClick={handleSubmit}>Shto Produktet</BlueButton>
          </div>
        </div>
      </div>
    )
  );
};

export default AddProductsToNgarkesaModal;
