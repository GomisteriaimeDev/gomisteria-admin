import React, { useEffect, useState } from "react";
import Dashboard from "../../../layouts/Dashboard";
import back from "../../../assets/svg/backArrow.svg";
import { useParams } from "react-router-dom";
import { getNgarkesaById, updateNgarkesa, removeProductFromNgarkesa } from "../../../services/api";
import "./NgarkesaDetails.scss";
import capitalize from "../../../utils/Capitalize";
import formatDate from "../../../utils/FormatDate";
import BlueButton from "../../../components/BlueButton/BlueButton";
import AddProductsToNgarkesaModal from "./AddProductsToNgarkesaModal/AddProductsToNgarkesaModal";
import TextInput from "../../../components/TextInput/TextInput";
import Loader from "../../../components/Loader";

const NgarkesaDetails = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [ngarkesa, setNgarkesa] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id: loadId } = useParams<any>();

  useEffect(() => {
    fetchNgarkesa();
  }, []);

  const fetchNgarkesa = async () => {
    const res = await getNgarkesaById(loadId);
    setNgarkesa(res);
    setIsLoading(false);
  };

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    setNgarkesa({ ...ngarkesa, [field]: e.target.value });
  };

  const handleSaveChanges = async () => {
    console.log("loadId", loadId);
    console.table(ngarkesa);
    await updateNgarkesa(loadId, ngarkesa);
    alert("Ngarkesa updated successfully!");
  };

  const handleProductChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: string
  ) => {
    const updatedProducts = [...ngarkesa.products];
    updatedProducts[index].product[field] = e.target.value;
    setNgarkesa({ ...ngarkesa, products: updatedProducts });
  };

  const handleRemoveProduct = async (productId: string) => {
    if (!window.confirm("A jeni i sigurt që doni ta hiqni këtë produkt?")) return;
    try {
      await removeProductFromNgarkesa(loadId!, productId);
      setNgarkesa({
        ...ngarkesa,
        products: ngarkesa.products.filter((p: any) => p.id !== productId),
      });
    } catch (error) {
      console.error("Failed to remove product:", error);
    }
  };

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Shitjet"}>
        <div className="ngarkesasWrapper">
          <div className="singlengarkesas">
            <a href="/loads">
              <img src={back} alt="Go back" />
            </a>
            <div className="ngarkesaInfo">
              <div className="ngarkesaDetails">
                <h5>Informacione</h5>
                <div className="ngarkesaInfoDetails">
                  {/* <div className="ngarkesaInfoDetailsItem">
                  <p>Emri i Ngarkesës</p>
                  <input
                  type="text"
                  value={ngarkesa.title || ""}
                  onChange={(e) => handleInputChange(e, "title")}
                  />
                  </div> */}
                  <div className="information">
                    <TextInput
                      label="Ngarkesa:"
                      name="Preorder Name"
                      value={ngarkesa.title || ""}
                      required={true}
                      handleChange={(e: any) => handleInputChange(e, "title")}
                    />
                  </div>

                  <div className="information">
                    <TextInput
                      label="Lloji:"
                      name="Category"
                      value={ngarkesa.category || ""}
                      required={true}
                      handleChange={(e) => handleInputChange(e, "category")}
                    />
                  </div>
                  <div className="ngarkesaInfoDetailsItem">
                    <p>U krijua</p>
                    <span>{formatDate(ngarkesa.createdAt)}</span>
                  </div>
                  <div className="ngarkesaInfoDetailsItem">
                    <p>Pritet të arrijë</p>
                    <input
                      type="date"
                      className="text-field"
                      value={ngarkesa.arrivalTime?.split("T")[0] || ""}
                      onChange={(e) => handleInputChange(e, "arrivalTime")}
                    />
                  </div>
                </div>
                <BlueButton onClick={handleSaveChanges}>
                  Ruaj Ndryshimet
                </BlueButton>
              </div>
            </div>

            <div className="products-section-ngarkesa-details">
              <h5>Produktet</h5>
              <table>
                <thead>
                  <tr>
                    <th>Produkt ID</th>
                    <th>Emri i Produktit</th>
                    <th>Marka</th>
                    <th>Çmimi</th>
                    <th>Sasia</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {ngarkesa.products?.map((data: any, index: number) => (
                    <tr key={data.id}>
                      <td>{data?.serialNumber}</td>
                      <td>
                        <div>{data?.name}</div>
                      </td>
                      <td>
                         <div>{data?.marka}</div>
                      </td>
                      <td>
                        <div>{data?.price}</div>
                      </td>
                      <td>
                        <div>{data?.stock}</div>
                      </td>
                      <td>
                        <button
                          className="removeProductBtn"
                          onClick={() => handleRemoveProduct(data.id)}
                        >
                          Hiq
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="addButton">
                <BlueButton onClick={handleModalOpen}>Shto Produkte</BlueButton>
              </div>
            </div>
          </div>
          <AddProductsToNgarkesaModal
            loadId={loadId}
            isOpen={isModalOpen}
            onClose={handleModalClose}
          />
        </div>
      </Dashboard>
    </>
  );
};

export default NgarkesaDetails;
