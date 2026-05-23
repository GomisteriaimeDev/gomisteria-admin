import React, { ChangeEvent, useState } from "react";
import "./NgarkesaModal.scss";
import useFetchData, {
  addProductsToNgarkesa,
  createNgarkesa,
  getProducts,
} from "../../services/api";
import BlueButton from "../../components/BlueButton/BlueButton";
import SelectInput from "../../components/SelectInput/SelectInput";
import OutlineButton from "../../components/OutlineButton/OutlineButton";
import capitalize from "../../utils/Capitalize";

const NgarkesaModal = ({ isOpen, onClose }: any) => {
  const [formData, setFormData] = useState({
    title: "",
    arrivalTime: "",
    openTime: "",
    category: "",
  });
  const [selectedProducts, setSelectedProducts] = useState<any>([]);
  const [quantities, setQuantities] = useState<{ [key: string]: number }>({});
  const { data: products } = useFetchData(getProducts, 1, 10000);

  const handleProductSelect = (productId: string) => {
    setSelectedProducts((prevSelected: any) => {
      if (prevSelected.includes(productId)) {
        return prevSelected.filter((id: string) => id !== productId);
      } else {
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

  const handleDateChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const formatDateToISO = (date: string) => {
    const dateObject = new Date(date);
    return dateObject.toISOString();
  };

  const handleSubmit = async () => {
    try {
      const ngarkesaData = {
        title: formData.title,
        arrivalTime: formatDateToISO(formData.arrivalTime),
        openTime: formatDateToISO(formData.openTime),
        category: formData.category,
      };
      const ngarkesaResponse = await createNgarkesa(ngarkesaData);

      if (
        ngarkesaResponse.statusCode === 201 ||
        ngarkesaResponse.statusCode === 200
      ) {
        const ngarkesaId = ngarkesaResponse.data.id;
        const productDetails = selectedProducts.map((productId: string) => ({
          productId,
          stock: quantities[productId] || 1,
        }));

        await addProductsToNgarkesa(ngarkesaId, productDetails);
        onClose();
      } else {
        console.error("Failed to create ngarkesa");
      }
    } catch (error) {
      console.error("An error occurred:", error);
    }
  };

  // Filter products based on selected category
  const filteredProducts = products?.data?.filter(
    (product: any) =>
      formData.category === "" || product.category === formData.category
  );

  return (
    isOpen && (
      <div className="modal-overlay-ngarkesa">
        <div className="modal-content-ngarkesa">
          <div className="modal-header-ngarkesa">
            <h2>Shto Ngarkesë</h2>
          </div>
          <div className="modal-body-ngarkesa">
            <div className="modal-body-inputs-ngarkesa">
              <div className="text-with-label-ngarkesa">
                <label className="input-label-text-ngarkesa">
                  Emri i Ngarkesës:
                  <input
                    type="text"
                    value={formData.title}
                    name="title"
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleDateChange("title", e.target.value)
                    }
                    className={`text-field-ngarkesa ${
                      formData.title ? "has-value" : ""
                    }`}
                  />
                </label>
              </div>
              <div className="date-picker-with-label-ngarkesa">
                <label className="input-label-date-ngarkesa">
                  <p>Koha arritjes:</p>
                  <input
                    type="date"
                    value={formData.arrivalTime}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleDateChange("arrivalTime", e.target.value)
                    }
                    className={`date-field-ngarkesa ${
                      formData.arrivalTime ? "has-value" : ""
                    }`}
                  />
                </label>
              </div>
              <div className="date-picker-with-label-ngarkesa">
                <label className="input-label-date-ngarkesa">
                  <p>Koha hapjes:</p>
                  <input
                    type="datetime-local"
                    value={formData.openTime}
                    onChange={(e: ChangeEvent<HTMLInputElement>) =>
                      handleDateChange("openTime", e.target.value)
                    }
                    className={`date-field-ngarkesa-time ${
                      formData.openTime ? "has-value" : ""
                    }`}
                  />
                </label>
              </div>
              <SelectInput
                className
                width={" calc(50% - 12px)"}
                label="Kategoria:"
                value={formData.category}
                handleChange={(e: ChangeEvent<HTMLInputElement>) =>
                  handleDateChange("category", e.target.value)
                }
                options={[
                  { value: "goma", label: "Goma" },
                  { value: "fellne", label: "Fellne" },
                  { value: "aksesore", label: "Aksesore" },
                ]}
              />
            </div>

            <div className="products-section-ngarkesa">
              <div className="ngarkesaTableHeader">
                <h3>Produktet</h3>
              </div>

              <table>
                <thead>
                  <tr>
                    <th></th>
                    <th>Produkt ID</th>
                    <th>Emri i Produktit</th>
                    <th>Kategoria</th>
                    <th>Marka</th>
                    <th>Çmimi</th>
                    <th style={{ width: "10px" }}>Sasia</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts?.map((product: any) => (
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
                      <td>{capitalize(product.category)}</td>
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

export default NgarkesaModal;
