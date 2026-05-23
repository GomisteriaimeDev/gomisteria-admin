import React, { useState, useEffect } from "react";
import axios from "axios";
import Dashboard from "../../layouts/Dashboard";
import "./Settings.scss";
import useFetchData, {
  getDiscounts,
  getServices,
  getCoupons,
  getBusinessTypes,
} from "../../services/api";
import Select from "react-select";

const Settings = () => {
  // Existing state
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);

  // Business Types state
  const [businessTypes, setBusinessTypes] = useState<any[]>([]);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenService, setIsModalOpenService] = useState(false);
  const [isModalOpenCoupon, setIsModalOpenCoupon] = useState(false);
  const [isModalOpenBusinessType, setIsModalOpenBusinessType] = useState(false);

  // Editing state
  const [isEditing, setIsEditing] = useState(false);

  // Current data for forms
  const [currentDiscount, setCurrentDiscount] = useState<any>({
    id: null,
    industry: "",
    value: "",
  });

  const [currentService, setCurrentService] = useState<any>({
    id: null,
    name: "",
    price: "",
  });

  const [currentCoupon, setCurrentCoupon] = useState<any>({
    id: null,
    code: "",
    value: "",
    expiryDate: "",
    type: "percentage",
    maxRedemptions: "",
    isActive: true,
  });
  const [originalCouponCode, setOriginalCouponCode] = useState<string>("");

  const [currentBusinessType, setCurrentBusinessType] = useState<any>({
    id: null,
    name: "",
  });

  const { data: discountData } = useFetchData(getDiscounts);
  const { data: serviceData } = useFetchData(getServices);
  const { data: couponData } = useFetchData(getCoupons);
  const { data: businessTypeData } = useFetchData(getBusinessTypes);

  useEffect(() => {
    if (discountData) setDiscounts(discountData);
  }, [discountData]);

  useEffect(() => {
    if (serviceData) setServices(serviceData);
  }, [serviceData]);

  useEffect(() => {
    if (couponData) setCoupons(couponData);
  }, [couponData]);

  useEffect(() => {
    if (businessTypeData) setBusinessTypes(businessTypeData);
  }, [businessTypeData]);

  // ========== DISCOUNTS ==========

  const openEditModal = (id: any, industry: any, value: any) => {
    setCurrentDiscount({ id, industry, value });
    setIsEditing(true);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setCurrentDiscount({ id: null, industry: "", value: "" });
    setIsEditing(false);
    setIsModalOpen(true);
  };

  const handleSaveDiscount = async () => {
    const token = localStorage.getItem("token");
    if (!currentDiscount.industry) {
      alert("Please select a business type.");
      return;
    }

    if (isEditing) {
      try {
        await axios.patch(
          `https://gomisteria-api.onrender.com/api/discount/${currentDiscount.id}`,
          { value: parseFloat(currentDiscount.value) },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const updatedDiscounts = discounts.map((item: any) =>
          item.id === currentDiscount.id
            ? { ...item, value: currentDiscount.value }
            : item
        );
        setDiscounts(updatedDiscounts);
        window.location.reload();
      } catch (error) {
        console.error("Error updating discount:", error);
      }
    } else {
      try {
        const response = await axios.post(
          `https://gomisteria-api.onrender.com/api/discount`,
          {
            // use selected business type name as "type"
            type: currentDiscount.industry,
            value: parseFloat(currentDiscount.value),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setDiscounts([...discounts, response.data]);
        window.location.reload();
      } catch (error) {
        console.error("Error creating discount:", error);
      }
    }
    setIsModalOpen(false);
  };

  // ========== SERVICES ==========

  const handleSaveService = async () => {
    const token = localStorage.getItem("token");

    if (isEditing) {
      try {
        await axios.patch(
          `https://gomisteria-api.onrender.com/api/services/${currentService.id}`,
          {
            name: currentService.name,
            price: parseFloat(currentService.price),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const updatedServices = services.map((item: any) =>
          item.id === currentService.id
            ? {
                ...item,
                name: currentService.name,
                price: currentService.price,
              }
            : item
        );
        setServices(updatedServices);
        window.location.reload();
      } catch (error) {
        console.error("Error updating service:", error);
      }
    } else {
      try {
        const response = await axios.post(
          `https://gomisteria-api.onrender.com/api/services`,
          {
            name: currentService.name,
            price: parseFloat(currentService.price),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setServices([...services, response.data]);
        window.location.reload();
      } catch (error) {
        console.error("Error creating service:", error);
      }
    }
    setIsModalOpenService(false);
  };

  // ========== COUPONS ==========

  const openCreateModalCoupon = () => {
    setCurrentCoupon({
      id: null,
      code: "",
      value: "",
      expiryDate: "",
      type: "percentage",
      maxRedemptions: "",
      isActive: true,
    });
    setIsEditing(false);
    setIsModalOpenCoupon(true);
  };

  const openEditModalCoupon = (coupon: any) => {
    setOriginalCouponCode(coupon.code);
    setCurrentCoupon({
      ...coupon,
      expiryDate: coupon.expiryDate
        ? coupon.expiryDate.split("T")[0] // normalize to yyyy-mm-dd
        : "",
      maxRedemptions:
        coupon.maxRedemptions !== undefined && coupon.maxRedemptions !== null
          ? coupon.maxRedemptions.toString()
          : "",
    });
    setIsEditing(true);
    setIsModalOpenCoupon(true);
  };

  const handleSaveCoupon = async () => {
    const expiryDateISO = currentCoupon.expiryDate
      ? new Date(currentCoupon.expiryDate + "T00:00:00").toISOString()
      : null;
    const token = localStorage.getItem("token");

    const payload = {
      code: currentCoupon.code,
      value: parseFloat(currentCoupon.value),
      expiryDate: expiryDateISO,
      type: currentCoupon.type,
      maxRedemptions: currentCoupon.maxRedemptions
        ? parseInt(currentCoupon.maxRedemptions, 10)
        : 0,
      isActive: currentCoupon.isActive,
    };

    if (isEditing) {
      try {
        await axios.patch(
          `https://gomisteria-api.onrender.com/api/coupons/${originalCouponCode}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        window.location.reload();
      } catch (error) {
        console.error("Error updating coupon:", error);
      }
    } else {
      try {
        const response = await axios.post(
          `https://gomisteria-api.onrender.com/api/coupons`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setCoupons([...coupons, response.data]);
      } catch (error) {
        console.error("Error creating coupon:", error);
      }
    }
    setIsModalOpenCoupon(false);
  };
  const handleDeleteCoupon = async (code: string) => {
    const token = localStorage.getItem("token");
    const confirmDelete = window.confirm(
      `A jeni i sigurt që doni ta fshini kuponin "${code}"?`
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://gomisteria-api.onrender.com/api/coupons/${code}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      window.location.reload();
      // Remove from UI immediately
      setCoupons((prev) => prev.filter((c: any) => c.code !== code));
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  const couponTypeOptions = [
    { value: "fixed", label: "Fixed" },
    { value: "percentage", label: "Percentage" },
  ];

  const handleCouponTypeChange = (selectedOption: any) => {
    setCurrentCoupon({ ...currentCoupon, type: selectedOption.value });
  };

  // ========== BUSINESS TYPES ==========

  const openCreateModalBusinessType = () => {
    setCurrentBusinessType({ id: null, name: "" });
    setIsEditing(false);
    setIsModalOpenBusinessType(true);
  };

  const openEditModalBusinessType = (businessType: any) => {
    setCurrentBusinessType(businessType);
    setIsEditing(true);
    setIsModalOpenBusinessType(true);
  };

  const handleSaveBusinessType = async () => {
    const token = localStorage.getItem("token");
    if (isEditing && currentBusinessType.id) {
      try {
        await axios.patch(
          `https://gomisteria-api.onrender.com/api/business-types/${currentBusinessType.id}`,
          { name: currentBusinessType.name },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const updatedList = businessTypes.map((item: any) =>
          item.id === currentBusinessType.id
            ? { ...item, name: currentBusinessType.name }
            : item
        );
        setBusinessTypes(updatedList);
        window.location.reload();
      } catch (error) {
        console.error("Error updating business type:", error);
      }
    } else {
      try {
        const response = await axios.post(
          `https://gomisteria-api.onrender.com/api/business-types`,
          { name: currentBusinessType.name },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setBusinessTypes([...businessTypes, response.data]);
        window.location.reload();
      } catch (error) {
        console.error("Error creating business type:", error);
      }
    }
    setIsModalOpenBusinessType(false);
  };

  // Shared handler for modal inputs
  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    if (isModalOpen) {
      setCurrentDiscount({ ...currentDiscount, [name]: value });
    } else if (isModalOpenService) {
      setCurrentService({ ...currentService, [name]: value });
    } else if (isModalOpenCoupon) {
      setCurrentCoupon({ ...currentCoupon, [name]: value });
    } else if (isModalOpenBusinessType) {
      setCurrentBusinessType({ ...currentBusinessType, [name]: value });
    }
  };

  // Options for business types dropdown
  const businessTypeOptions =
    businessTypes?.map((bt: any) => ({
      value: bt.name,
      label: bt.name,
    })) || [];

  const selectedBusinessTypeOption = businessTypeOptions.find(
    (opt) => opt.value === currentDiscount.industry
  );

  return (
    <Dashboard pageTitle={"Konfigurimet"}>
      <div className="settingsWrapper">
        <div className="dashboardHeader">
          <h2>Konfigurimet</h2>
        </div>
        <div className="settingsCards">
          {/* Discounts */}
          <div className="industryDiscounts">
            <div className="header">
              <h3>Zbritjet e Industrisë</h3>
              <svg
                onClick={openCreateModal}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1e8ca5"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-plus-square"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            {discounts.map((item: any, index: number) => (
              <div className="discountItem" key={index}>
                <div className="itemInfo">
                  <span>{item.type}</span>
                  <span>
                    <strong>{item.value}%</strong>
                  </span>
                </div>
                <button
                  onClick={() =>
                    // use item.type as the "industry" value
                    openEditModal(item.id, item.type, item.value)
                  }
                >
                  Change
                </button>
              </div>
            ))}
          </div>

          {/* Services */}
          {/* <div className="industryDiscounts">
            <div className="header">
              <h3>Shërbime</h3>
              <svg
                onClick={openCreateModalServices}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1e8ca5"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-plus-square"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            {services.map((item: any, index: number) => (
              <div className="discountItem" key={index}>
                <div className="itemInfo">
                  <span>{item.name}</span>
                  <span>
                    <strong>{item.price}€</strong>
                  </span>
                </div>
                <button
                  onClick={() =>
                    openEditModalServices(item.id, item.name, item.price)
                  }
                >
                  Change
                </button>
              </div>
            ))}
          </div> */}

          {/* Coupons */}
          <div className="industryDiscounts">
            <div className="header">
              <h3>Kuponët</h3>
              <svg
                onClick={openCreateModalCoupon}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1e8ca5"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-plus-square"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            {coupons.map((item: any, index: number) => (
              <div className="discountItem" key={index}>
                <div className="itemInfo">
                  <span>{item.code}</span>
                  <span>
                    <strong>
                      {item.value}
                      {item.type === "fixed" ? "€" : "%"}
                    </strong>
                  </span>
                </div>
                <button onClick={() => openEditModalCoupon(item)}>
                  Change
                </button>
              </div>
            ))}
          </div>

          {/* Business Types */}
          <div className="industryDiscounts">
            <div className="header">
              <h3>Llojet e Biznesve</h3>
              <svg
                onClick={openCreateModalBusinessType}
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1e8ca5"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="feather feather-plus-square"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
            </div>
            {businessTypes.map((bt: any, index: number) => (
              <div className="discountItem" key={index}>
                <div className="itemInfo">
                  <span>{bt.name}</span>
                </div>
                <button onClick={() => openEditModalBusinessType(bt)}>
                  Change
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ====== MODALS ====== */}

      {/* Discount Modal */}
      {isModalOpen && (
        <div className="modal">
          <div className="modalContent">
            <h3>{isEditing ? "Përditëso Zbritjen" : "Krijo Zbritje"}</h3>
            <label>Zgjidh Llojin e Biznesit</label>
            <Select
              options={businessTypeOptions}
              value={selectedBusinessTypeOption || null}
              onChange={(selected: any) =>
                setCurrentDiscount({
                  ...currentDiscount,
                  industry: selected?.value || "",
                })
              }
              placeholder="Zgjidh Llojin e Biznesit"
              styles={{
                singleValue: (base) => ({
                  ...base,
                  float: "left",
                  textAlign: "left",
                }),
                placeholder: (base) => ({
                  ...base,
                  float: "left",
                  textAlign: "left",
                }),
              }}
            />
            <label>Zbritje (%)</label>
            <input
              type="number"
              name="value"
              placeholder="Zbritje (%)"
              value={currentDiscount.value}
              onChange={handleInputChange}
            />
            <div className="createDiscountModalButtons">
              <button onClick={handleSaveDiscount}>Ruaj</button>
              <button onClick={() => setIsModalOpen(false)}>Anulo</button>
            </div>
          </div>
        </div>
      )}

      {/* Service Modal */}
      {isModalOpenService && (
        <div className="modal">
          <div className="modalContent">
            <h3>{isEditing ? "Përditëso Shërbimin" : "Krijo Shërbim"}</h3>
            <input
              type="text"
              name="name"
              placeholder="Emri i Shërbimit"
              value={currentService.name}
              onChange={handleInputChange}
            />
            <input
              type="number"
              name="price"
              placeholder="Çmimi"
              value={currentService.price}
              onChange={handleInputChange}
            />
            <div className="createDiscountModalButtons">
              <button onClick={handleSaveService}>Ruaj</button>
              <button onClick={() => setIsModalOpenService(false)}>
                Anulo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {isModalOpenCoupon && (
        <div className="modal">
          <div className="modalContent">
            <h3>{isEditing ? "Përditëso Kuponin" : "Krijo Kupon"}</h3>
            <label>Kodi i Kuponit</label>
            <input
              type="text"
              name="code"
              placeholder="Kodi i Kuponit"
              value={currentCoupon.code}
              onChange={handleInputChange}
            />
            <label>Zbritje</label>
            <input
              type="number"
              name="value"
              placeholder="Zbritje"
              value={currentCoupon.value}
              onChange={handleInputChange}
            />
            <label>Data e Skadimit</label>
            <input
              type="date"
              name="expiryDate"
              placeholder="Data e Skadimit"
              value={currentCoupon.expiryDate || ""}
              onChange={handleInputChange}
            />{" "}
            <label>Përdorimet Maksimale</label>
            <input
              type="number"
              name="maxRedemptions"
              placeholder="Përdorimet Maksimale"
              value={currentCoupon.maxRedemptions}
              onChange={handleInputChange}
            />
            <label>Zgjidh Llojin</label>
            <Select
              options={couponTypeOptions}
              value={couponTypeOptions.find(
                (option) => option.value === currentCoupon.type
              )}
              onChange={handleCouponTypeChange}
              placeholder="Zgjidh Llojin"
              styles={{
                singleValue: (base) => ({
                  ...base,
                  float: "left",
                  textAlign: "left",
                }),
                placeholder: (base) => ({
                  ...base,
                  float: "left",
                  textAlign: "left",
                }),
              }}
            />
            <div className="createDiscountModalButtons">
              <button onClick={handleSaveCoupon}>Ruaj</button>
              <button onClick={() => setIsModalOpenCoupon(false)}>Anulo</button>
              {isEditing && (
                <button onClick={() => handleDeleteCoupon(currentCoupon?.code)}>
                  Delete
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* BusinessType Modal */}
      {isModalOpenBusinessType && (
        <div className="modal">
          <div className="modalContent">
            <h3>
              {isEditing ? "Përditëso Llojin e Biznesit" : "Krijo Lloj Biznesi"}
            </h3>
            <label>Emri i Llojit të Biznesit</label>
            <input
              type="text"
              name="name"
              placeholder="Emri i Llojit të Biznesit"
              value={currentBusinessType.name}
              onChange={handleInputChange}
            />
            <div className="createDiscountModalButtons">
              <button onClick={handleSaveBusinessType}>Ruaj</button>
              <button onClick={() => setIsModalOpenBusinessType(false)}>
                Anulo
              </button>
            </div>
          </div>
        </div>
      )}
    </Dashboard>
  );
};

export default Settings;
