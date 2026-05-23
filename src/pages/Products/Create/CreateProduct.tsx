import React, { ChangeEvent, useState, useEffect } from "react";
import axios from "axios";
import back from "../../../assets/svg/backArrow.svg";
import Dashboard from "../../../layouts/Dashboard";
import "./CreateProduct.scss";
import TextInput from "../../../components/TextInput/TextInput";
import BlueButton from "../../../components/BlueButton/BlueButton";
import SelectInputCreateProduct from "../../../components/SelectInputCreateProduct/SelectInputCreateProduct";
import SelectInput from "../../../components/SelectInput/SelectInput";
import upload from "../../../assets/svg/upload.svg";
import { useNavigate } from "react-router-dom";

const CreateProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    serialNumber: "",
    name: "",
    description: "",
    images: [] as File[],
    stock: "",
    price: "",
    salePrice: "",
    category: "goma",
    marka: "",
    madhesiaGomes: "",
    sezona: "",
    indeksiNgarkeses: "",
    indeksiShpejtesise: "",
    cb: "",
    et: "",
    hpcd: "",
    ngjyra: "",
    gjeresia: "",
    dimenzioni: "",
    type: "",
    use: "",
  });

  // 🔍 NEW: previews for multiple images (mirrors employee logic but supports array)
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const [isLoading, setIsLoading] = useState(false);

  const handleFormSelection = (event: ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, category: event.target.value });
  };

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    let { name, value } = event.target;

    if (name.startsWith("no-autofill-")) {
      name = name.replace("no-autofill-", "");
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🔁 NEW: multi-image upload + preview + URL cleanup-friendly
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;

    if (!files) return;

    const newFiles = Array.from(files);

    // Create preview URLs for each new file
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));

    setImagePreviews((prev) => [...prev, ...newPreviews]);
  };

  // 🧹 Cleanup all created object URLs when component unmounts or previews change
  useEffect(() => {
    return () => {
      imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [imagePreviews]);

  // ✅ Basic frontend validation
  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!formData.serialNumber.trim())
      errors.push("Numri serik është i detyrueshëm.");
    if (!formData.name.trim())
      errors.push("Emri i produktit është i detyrueshëm.");
    if (!formData.description.trim())
      errors.push("Përshkrimi është i detyrueshëm.");

    const stock = Number(formData.stock);
    const price = Number(formData.price);
    const salePrice = formData.salePrice ? Number(formData.salePrice) : null;

    if (isNaN(stock) || stock < 0)
      errors.push("Stock duhet të jetë numër pozitiv.");
    if (isNaN(price) || price <= 0)
      errors.push("Çmimi duhet të jetë numër më i madh se 0.");
    if (salePrice !== null && (isNaN(salePrice) || salePrice < 0)) {
      errors.push("Çmimi në zbritje duhet të jetë numër pozitiv.");
    }

    if (formData.category === "goma") {
      if (!formData.marka.trim())
        errors.push("Marka është e detyrueshme për goma.");
      if (!formData.madhesiaGomes.trim())
        errors.push("Madhësia e gomës është e detyrueshme.");
      if (!formData.sezona) errors.push("Sezona është e detyrueshme.");
    }

    if (formData.category === "fellne") {
      if (formData.cb && isNaN(Number(formData.cb)))
        errors.push("CB duhet të jetë numër.");
      if (formData.et && isNaN(Number(formData.et)))
        errors.push("ET duhet të jetë numër.");

      if (formData.gjeresia && isNaN(Number(formData.gjeresia))) {
        errors.push("Gjerësia duhet të jetë numër.");
      }
      if (formData.dimenzioni && isNaN(Number(formData.dimenzioni))) {
        errors.push("Dimensioni duhet të jetë numër.");
      }
    }

    if (errors.length > 0) {
      alert(errors.join("\n"));
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    // ✅ block submit if invalid
    if (!validateForm()) return;

    try {
      setIsLoading(true);

      const formDataToSend = new FormData();

      formDataToSend.append("serialNumber", formData.serialNumber);
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("salePrice", formData.salePrice);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("marka", formData.marka);

      // 🚀 send up to 3 images, same as before – now with preview support
      formData.images.forEach((file, index) => {
        if (index < 3) {
          formDataToSend.append("images", file, file.name);
        }
      });

      let details;
      if (formData.category === "fellne") {
        details = {
          cb: formData.cb,
          et: formData.et,
          hpcd: formData.hpcd,
          ngjyra: formData.ngjyra,
          gjeresia: formData.gjeresia,
          dimenzioni: formData.dimenzioni,
        };
      } else if (formData.category === "goma") {
        details = {
          madhesiaGomes: formData.madhesiaGomes,
          sezona: formData.sezona,
          indeksiNgarkeses: formData.indeksiNgarkeses,
          indeksiShpejtesise: formData.indeksiShpejtesise,
        };
      } else if (formData.category === "aksesore") {
        details = {
          type: formData.type,
          use: formData.use,
        };
      }

      formDataToSend.append("details", JSON.stringify(details));
      const token = localStorage.getItem("token");

      const response = await axios.post(
        "https://gomisteria-api.onrender.com/api/products",
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response);
      alert("Produkti u shtua me sukses!");
      navigate("/products");
    } catch (error) {
      console.error(error);
      alert("Ndodhi një gabim gjatë ruajtjes së produktit.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dashboard pageTitle={"Shitjet"}>
      <div className="createWrapper">
        <a href="/products">
          <img src={back} alt="back" />
        </a>
        <div className="createHeader">
          <h2 className="createHeaderText">Shto Produkt</h2>
          <div className="createSelection">
            <SelectInputCreateProduct
              label="Kategoria:"
              handleChange={handleFormSelection}
              options={[
                { value: "goma", label: "Goma" },
                { value: "fellne", label: "Fellne" },
                { value: "aksesore", label: "Aksesore" },
              ]}
            />
          </div>
        </div>

        <div className="productCreateForm">
          <div className="information">
            <TextInput
              label="Numri Serik:"
              name="serialNumber"
              value={formData.serialNumber}
              handleChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
          <div className="information">
            <TextInput
              label="Emri i Produktit:"
              name="name"
              value={formData.name}
              handleChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
          <div className="information">
            <TextInput
              label="Përshkrimi:"
              name="description"
              value={formData.description}
              handleChange={handleInputChange}
              disabled={isLoading}
            />
          </div>
          <div className="information">
            <TextInput
              label="Stock:"
              name="stock"
              value={formData.stock}
              handleChange={handleInputChange}
              type="number"
              disabled={isLoading}
            />
          </div>
          <div className="information">
            <TextInput
              label="Çmimi:"
              name="price"
              value={formData.price}
              handleChange={handleInputChange}
              type="number"
              disabled={isLoading}
            />
          </div>
          <div className="information">
            <TextInput
              label="Çmimi në zbritje:"
              name="salePrice"
              value={formData.salePrice}
              handleChange={handleInputChange}
              type="number"
              disabled={isLoading}
            />
          </div>

          {formData.category === "goma" && (
            <>
              <div className="information">
                <TextInput
                  label="Marka:"
                  name="marka"
                  value={formData.marka}
                  handleChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Madhësia e gomës:"
                  name="madhesiaGomes"
                  value={formData.madhesiaGomes}
                  handleChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <SelectInput
                  label="Sezona:"
                  name="sezona"
                  value={formData.sezona}
                  handleChange={handleInputChange}
                  options={[
                    { value: "Verore", label: "Verore" },
                    { value: "Dimërore", label: "Dimërore" },
                  ]}
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Indeksi i ngarkesës:"
                  name="indeksiNgarkeses"
                  value={formData.indeksiNgarkeses}
                  handleChange={handleInputChange}
                  type="number"
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Indeksi i shpejtësisë:"
                  name="indeksiShpejtesise"
                  value={formData.indeksiShpejtesise}
                  handleChange={handleInputChange}
                  type="number"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {formData.category === "fellne" && (
            <>
              <div className="information">
                <TextInput
                  label="CB:"
                  name="cb"
                  value={formData.cb}
                  handleChange={handleInputChange}
                  type="number"
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <TextInput
                  label="ET:"
                  name="et"
                  value={formData.et}
                  handleChange={handleInputChange}
                  type="number"
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <TextInput
                  label="HPCD:"
                  name="hpcd"
                  value={formData.hpcd}
                  handleChange={handleInputChange}
                  type="number"
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Ngjyra:"
                  name="ngjyra"
                  value={formData.ngjyra}
                  handleChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Gjerësia:"
                  name="gjeresia"
                  value={formData.gjeresia}
                  handleChange={handleInputChange}
                  type="number"
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Dimensioni:"
                  name="dimenzioni"
                  value={formData.dimenzioni}
                  handleChange={handleInputChange}
                  type="number"
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          {formData.category === "aksesore" && (
            <>
              <div className="information">
                <TextInput
                  label="Lloji:"
                  name="type"
                  value={formData.type}
                  handleChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
              <div className="information">
                <TextInput
                  label="Përdorimi:"
                  name="use"
                  value={formData.use}
                  handleChange={handleInputChange}
                  disabled={isLoading}
                />
              </div>
            </>
          )}

          <div className="information">
            <div className="fileInputContainer">
              <input
                type="file"
                id="images"
                name="images"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
                multiple
                disabled={isLoading}
              />
              <label htmlFor="images" className="customFileInput">
                {imagePreviews.length > 0 ? (
                  <div className="uploaded-preview-grid">
                    {imagePreviews.map((src, idx) => (
                      <img
                        key={idx}
                        src={src}
                        alt={`Preview ${idx + 1}`}
                        className="uploaded-preview"
                      />
                    ))}
                  </div>
                ) : (
                  <>
                    <p>Ngarko Imazhin</p>
                    <img src={upload} alt="" className="customFIleInputImage" />
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        <BlueButton
          className="createButton"
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Duke u ruajtur..." : "Shto"}
        </BlueButton>
      </div>
    </Dashboard>
  );
};

export default CreateProduct;
