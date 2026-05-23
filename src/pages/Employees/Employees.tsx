import React, { useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import "./Employees.scss";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import BlueButton from "../../components/BlueButton/BlueButton";
import useFetchData, { getEmployees } from "../../services/api";
import { useNavigate } from "react-router-dom";
import EmployeeCard from "../../components/EmployeeCard/EmployeeCard";
import Pagination from "../../components/Pagination/Pagination";
import Loader from "../../components/Loader";

const getStatusParam = (option: string): string | undefined => {
  switch (option) {
    case "Aktive": return "active";
    case "Mbyllur": return "closed";
    default: return undefined;
  }
};

const Employees = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("Të gjitha");

  const statusParam = getStatusParam(selectedOption);
  const { data, isLoading } = useFetchData(
    getEmployees,
    currentPage,
    10,
    "updatedAt",
    "desc",
    statusParam,
    undefined
  );
  const totalItems = data ? data.total : 0;
  const totalPages = Math.ceil(totalItems / 10);
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const options = ["Të gjitha", "Aktive", "Mbyllur"];

  const handleDropdownChange = (value: any) => {
    setSelectedOption(value);
    setCurrentPage(1);
  };

  const filteredData = data?.data || [];

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Punëtorët"}>
        <div className="salesWrapper">
          <div className="dashboardHeader">
            <div className="actionsHeaderButtonsLeft">
              <h2>Punëtorët</h2>
              <a href="/employees/create">
                <BlueButton>Shto Punëtorë</BlueButton>
              </a>
            </div>
            <div className="actionsHeader">
              <FilterDropdown
                label="Shfaq:"
                options={options}
                selectedValue={selectedOption}
                onChange={handleDropdownChange}
              />
            </div>
          </div>
          <div className="employeeCards">
            {filteredData?.map((data: any, index: any) => (
              <EmployeeCard
                key={index}
                data={data}
                employeeImage={data?.Image[0]?.url}
                employeeName={data?.specialFields?.fullName}
                employeeCode={data?.specialFields?.idPunetorit}
                orders={data.OrdersAssigned}
              />
            ))}
          </div>
          <div className="paginationSection">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
            />
          </div>
        </div>
      </Dashboard>
    </>
  );
};

export default Employees;
