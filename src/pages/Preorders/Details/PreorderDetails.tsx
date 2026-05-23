import React, { useEffect, useState, ChangeEvent } from "react";
import Dashboard from "../../../layouts/Dashboard";
import back from "../../../assets/svg/backArrow.svg";
import { useParams } from "react-router-dom";
import { getPreorderById, updatePreorderStatus } from "../../../services/api";
import "./PreorderDetails.scss";
import capitalize from "../../../utils/Capitalize";
import BlueButton from "../../../components/BlueButton/BlueButton";
import formatDate from "../../../utils/FormatDate";
import SelectInput from "../../../components/SelectInput/SelectInput";
import Loader from "../../../components/Loader";
import Preorders from "../Preorders";

const PreorderDetails = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [preOrder, setPreOrder] = useState<any>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [status, setStatus] = useState<string>("");
  const { id } = useParams();

  const fetchPreOrder = async () => {
    const res = await getPreorderById(id);
    setPreOrder(res.data);
    setStatus(res.data.status);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchPreOrder();
  }, []);

  const handleStatusChange = async (e: ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    await updatePreorderStatus(id, newStatus);
    fetchPreOrder();
  };

  const getStatusDot = (status: string) => {
    switch (status) {
      case "COMPLETED":
        return <span className="status-dot lightBlue"></span>;
      case "PENDING":
        return <span className="status-dot yellow"></span>;

      case "CANCELLED":
        return <span className="status-dot red"></span>;
      default:
        return <span className="status-dot unknown"></span>;
    }
  };
  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Shitjet"}>
        <div className="ngarkesasWrapper">
          <div className="singlengarkesas">
            <a href="/reservations">
              <img src={back} alt="Back" />
            </a>
            <div className="preorderInfo">
              <div className="PreorderDetails">
                <h5>Informacione</h5>
                <div className="preorderInfoWrapper">
                  <div className="ngarkesaInfoDetails">
                    <div className="ngarkesaInfoDetailsItem">
                      <p>Emri i Ngarkesës</p>
                      <span>{capitalize(preOrder?.Ngarkesa?.title)}</span>
                    </div>
                    <div className="ngarkesaInfoDetailsItem">
                      <p>Data</p>
                      <span>{formatDate(preOrder?.updatedAt)}</span>
                    </div>
                    <div className="ngarkesaInfoDetailsItem">
                      <p>Kategoria</p>
                      <span>{capitalize(preOrder?.Ngarkesa?.category)}</span>
                    </div>
                  </div>
                  <div className="ngarkesaInfoDetails">
                    <div className="ngarkesaInfoDetailsItem">
                      <p>Emri i klientit</p>
                      <span>
                        {capitalize(
                          preOrder?.user?.specialFields?.fullName ||
                            preOrder?.user?.specialFields?.companyName
                        )}
                      </span>
                    </div>
                    <div className="ngarkesaInfoDetailsItem">
                      <p>Emaili i klientit</p>
                      <span>{preOrder?.user?.email}</span>
                    </div>
                    <div className="ngarkesaInfoDetailsItem">
                      <p>Adresa</p>
                      <span>{preOrder?.shippingDetails}</span>
                    </div>
                    <div className="ngarkesaInfoDetailsItem">
                      <p>Totali</p>
                      <span>{preOrder?.total?.toFixed(2)}€</span>
                    </div>
                  </div>
                  <div className="ngarkesaInfoDetails">
                    <SelectInput
                      value={status}
                      handleChange={handleStatusChange}
                      options={[
                        { value: "COMPLETED", label: "Completed" },
                        { value: "PENDING", label: "Pending" },
                        { value: "CANCELLED", label: "Cancelled" },
                      ]}
                    />
                  </div>
                </div>
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
                  </tr>
                </thead>
                <tbody>
                  {preOrder?.items?.map((preOrder: any) => (
                    <tr>
                      <td>
                        <a href={`/product/${preOrder?.product?.id}`}>
                          {preOrder?.product?.serialNumber}
                        </a>
                      </td>
                      <td>
                        {" "}
                        <img
                          src={preOrder?.product?.images}
                          alt=""
                          className="product-image-preorder"
                        />
                        <a href={`/product/${preOrder?.product?.id}`}>
                          {preOrder?.product?.name}
                        </a>
                      </td>
                      <td>
                        {" "}
                        <a href={`/product/${preOrder?.product?.id}`}>
                          {preOrder?.product?.marka}
                        </a>
                      </td>
                      <td>
                        {" "}
                        <a href={`/product/${preOrder?.product?.id}`}>
                          {preOrder?.product?.price}
                        </a>
                      </td>
                      <td>
                        {" "}
                        <a href={`/product/${preOrder?.product?.id}`}>
                          {preOrder?.quantity}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Dashboard>
    </>
  );
};

export default PreorderDetails;
