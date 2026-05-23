import React, { useState } from "react";
import Dashboard from "../../../layouts/Dashboard";
import "./Approvim.scss";
import Table from "../../../components/Table/Table";
import FilterDropdown from "../../../components/FilterDropdown/FilterDropdown";
import useFetchData, { getBusinesses } from "../../../services/api";
import { useNavigate } from "react-router-dom";
import back from "../../../assets/svg/backArrow.svg";
import edit from "../../../assets/svg/edit.svg";
import BusinessModal from "../BusinessModal";
import Pagination from "../../../components/Pagination/Pagination";
const Approvim = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { data } = useFetchData(getBusinesses, currentPage, 10, "updatedAt", "desc");
  const totalItems = data ? data.total : 0;
  const totalPages = Math.ceil(totalItems / 10);
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);
  const [selectedOption, setSelectedOption] = useState("Të gjitha");
  const navigate = useNavigate();
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const options = ["Të gjitha", "Aktive", "Mbyllur"];

  const handleDropdownChange = (value: any) => {
    setSelectedOption(value);
  };

  const handleRowClick = (id: any) => {
    navigate(`/businesses/activate`);
  };
  const handleEditClick = (business: any) => {
    setSelectedBusiness(business);
    setIsModalOpen(true);
  };
  const columns = [
    { title: "ID", width: "6%" },
    { title: "Emri i Kompanisë", width: "22%" },
    { title: "ARBK Numri", width: "14%" },
    { title: "Industria", width: "16%" },
    { title: "Email", width: "22%" },
    { title: "Numri i Telefonit", width: "14%" },
    { title: "", width: "6%" },
  ];
  const filteredData =
    data?.data.filter((business: any) => !business.isActivated) || [];

  const rows =
    filteredData.map((business: any) => ({
      cells: [
        { content: business.id.slice(0, 5) },
        { content: business.specialFields.companyName },
        { content: business.specialFields.nrARBK },
        { content: business.specialFields.businessType },
        { content: business.email },
        { content: business.specialFields.phone },
        {
          content: (
            <img
              src={edit}
              alt="editIcon"
              onClick={(e) => {
                e.stopPropagation();
                handleEditClick(business);
              }}
            />
          ),
        },
      ],
      onClick: () => handleRowClick(business.id),
    })) || [];
  return (
    <Dashboard pageTitle={"Shitjet"}>
      <div className="salesWrapper">
        {" "}
        <div className="dashboardHeader">
          <h2>
            <a href="/businesses" style={{ marginRight: 25 }}>
              <img src={back} alt="backArrow" />
            </a>
            Bizneset për aprovim
          </h2>
          <FilterDropdown
            label="Shfaq:"
            options={options}
            selectedValue={selectedOption}
            onChange={handleDropdownChange}
          />
        </div>
        <Table columns={columns} rows={rows} />
        <div className="paginationSection">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={paginate}
          />
        </div>
      </div>
      {isModalOpen && (
        <BusinessModal
          business={selectedBusiness}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </Dashboard>
  );
};

export default Approvim;
