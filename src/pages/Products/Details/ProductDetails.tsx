import React, { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
import "./ProductDetails.scss";
import { useParams } from "react-router-dom";
import Dashboard from "../../../layouts/Dashboard";
import BlueButton from "../../../components/BlueButton/BlueButton";
import capitalize from "../../../utils/Capitalize";
import upload from "../../../assets/svg/upload.svg";
import back from "../../../assets/svg/backArrow.svg";
import TextInput from "../../../components/TextInput/TextInput";
import x from "../../../assets/svg/x-circle.svg";
import OutlineButton from "../../../components/OutlineButton/OutlineButton";
import ConfirmationDialog from "../../../components/ConfirmationDialog/ConfirmationDialog";
import DangerOutlineButton from "../../../components/DangerOutlineButton/DangerOutlineButton";

const inputTypes: any = {
  serialNumber: "text",
  name: "text",
  description: "text",
  price: "number",
  stock: "number",
  salePrice: "number",
  category: "select",
  marka: "text",
  sezona: "select",
  madhesiaGomes: "text",
  indeksiNgarkeses: "text",
  indeksiShpejtesise: "text",
};

const categories = [
  { value: "goma", label: "Goma" },
  { value: "fellne", label: "Fellne" },
  { value: "aksesore", label: "Aksesore" },
];

const seasons = [
  { value: "Verore", label: "Verore" },
  { value: "Dimërore", label: "Dimërore" },
];

const ProductDetails = () => {
  const { id: productId } = useParams();
  const [product, setProduct] = useState<any>({
    serialNumber: "",
    name: "",
    description: "",
    price: "",
    stock: "",
    salePrice: "",
    category: "goma",
    marka: "",
    details: {
      sezona: "",
      madhesiaGomes: "",
      indeksiNgarkeses: "",
      indeksiShpejtesise: "",
    },
    images: [],
  });
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<any>({ ...product });
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const token = localStorage.getItem("token");
  useEffect(() => {
    axios
      .get(`https://gomisteria-api.onrender.com/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        setProduct(response.data);
        setFormData(response.data);
      })
      .catch((error) => console.error("Error fetching product:", error));
  }, [productId]);

  const handleEditToggle = () => {
    setEditing(!editing);
    window.location.href = "/products";
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    let { name, value } = e.target;
      if (name.startsWith("no-autofill-")) {
        name = name.replace("no-autofill-", "");
      }
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  
  const handleDetailsChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      details: { ...prev.details, [name]: value },
    }));
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setFormData((prev: any) => ({
        ...prev,
        images: [...prev.images, ...Array.from(files)],
      }));
    }
  };

  const handleRemoveImage = (imageId: string) => {
    setFormData((prev: any) => ({
      ...prev,
      images: prev.images.filter((image: any) => image.id !== imageId),
    }));
    setImagesToRemove((prev) => [...prev, imageId]);
  };

  const handleUpdate = () => {
    const formDataToSend = new FormData();

    formDataToSend.append("serialNumber", formData.serialNumber);
    formDataToSend.append("name", formData.name);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("stock", formData.stock);
    formDataToSend.append("price", formData.price);
    formDataToSend.append("salePrice", formData.salePrice);
    formDataToSend.append("category", formData.category);
    formDataToSend.append("marka", formData.marka);

    formData.images.forEach((file: any) => {
      if (typeof file === "object" && "name" in file) {
        formDataToSend.append("images", file, file.name);
      }
    });

    imagesToRemove.forEach((imageId) => {
      formDataToSend.append("imagesToRemove[]", imageId);
    });

    const details = { ...formData.details };

    formDataToSend.append("details", JSON.stringify(details));

    axios
      .patch(
        `https://gomisteria-api.onrender.com/api/products/${productId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      )
      .then((response) => {
        setProduct({ ...product, ...formData });
        setEditing(false);
        alert("Product updated successfully!");
        window.location.reload();
      })
      .catch((error) => {
        console.error("Error updating product:", error);
        alert("Failed to update product!");
      });
  };

  const handleDelete = () => {
    setShowDialog(true);
  };

  const confirmDelete = () => {
    axios
      .delete(`https://gomisteria-api.onrender.com/api/products/${productId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      })
      .then((response) => {
        alert("Product deleted successfully!");
        window.location.href = "/products";
      })
      .catch((error) => {
        console.error("Error deleting product:", error);
        alert("Failed to delete product!");
      });
    setShowDialog(false);
  };

  const cancelDelete = () => {
    setProductToDelete(null);
    setShowDialog(false);
  };

  const renderInput = (
    field: string,
    value: any,
    onChange: (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >
    ) => void
  ) => {
    const inputType = inputTypes[field];
    if (inputType === "textarea") {
      return <textarea name={field} value={value} onChange={onChange} />;
    } else if (inputType === "select") {
      const options = field === "category" ? categories : seasons;
      return (
        <div className="selector-with-label">
          <label className="input-label-select">
            <select
              name={field}
              value={value}
              onChange={onChange}
              className={`select-field ${value ? "has-value" : ""}`}
            >
              {options?.map((option: any, index: number) => (
                <option key={index} value={option?.value}>
                  {option?.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      );
    } else {
      return (
        <TextInput
          name={field}
          value={value}
          handleChange={onChange}
          width="100%"
        />
      );
    }
  };

  return (
    <Dashboard>
      <div className="product-details">
        <a href="/products">
          <img src={back} alt="back" />
        </a>
        <div className="details">
          <div className="edit-mode">
            {Object.keys(product).map(
              (field) =>
                field !== "images" &&
                field !== "details" &&
                field !== "salePercent" &&
                field !== "id" &&
                field !== "tags" &&
                field !== "isDeleted" &&
                field !== "deletedAt" &&
                field !== "deletedBy" && (
                  <div key={field} className="information">
                    <label>{capitalize(field)}:</label>
                    {renderInput(field, formData[field], handleChange)}
                  </div>
                )
            )}

            {Object.keys(product.details).map((detail) => (
              <div key={detail} className="detailInput">
                <label>{capitalize(detail)}:</label>
                {renderInput(
                  detail,
                  formData.details[detail],
                  handleDetailsChange
                )}
              </div>
            ))}
          </div>
          <div className="images">
            <div className="image-list">
              {formData.images.map((file: any, index: number) => (
                <div className="image-item" key={file.name || file.id}>
                  <img
                    src={
                      typeof file === "object" && "name" in file
                        ? URL.createObjectURL(file)
                        : file.url
                    }
                    alt=""
                    width={100}
                  />
                  {typeof file !== "object" || !("name" in file) ? (
                    <img
                      src={x}
                      alt="Remove"
                      className="x"
                      onClick={() => handleRemoveImage(file.id)}
                    />
                  ) : null}
                </div>
              ))}
              <div className="image-item">
                <div className="fileInputContainerEdit">
                  <input
                    type="file"
                    id="images"
                    name="images"
                    style={{ display: "none" }}
                    onChange={handleFileChange}
                    multiple
                  />
                  <label htmlFor="images" className="customFileInput">
                    <p>Ngarko Imazhin</p>
                    <img src={upload} alt="" className="customFIleInputImage" />
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="actionButtons">
          <BlueButton onClick={handleUpdate}>Save</BlueButton>
          <OutlineButton onClick={handleEditToggle}>Cancel</OutlineButton>
          <DangerOutlineButton onClick={handleDelete}>
            Delete
          </DangerOutlineButton>
        </div>
      </div>
      {showDialog && (
        <ConfirmationDialog
          message="Do you want to delete this product?"
          productTitle={product.name}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
        />
      )}
    </Dashboard>
  );
};

export default ProductDetails;
