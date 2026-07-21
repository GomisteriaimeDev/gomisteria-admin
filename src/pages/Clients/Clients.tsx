import React, { useCallback, useMemo, useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import Table from "../../components/Table/Table";
import useFetchData, { getClients } from "../../services/api";
import Pagination from "../../components/Pagination/Pagination";
import Loader from "../../components/Loader";
import useDebounce from "../../hooks/useDebounce";

const Clients = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 400);

  const { data, isLoading } = useFetchData(
    getClients,
    currentPage,
    10,
    "createdAt",
    "desc",
    undefined,
    debouncedSearch || undefined
  );

  const totalItems = data ? data.total : 0;
  const totalPages = Math.ceil(totalItems / 10);
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const handleSearchChange = useCallback(
    (payload: { global?: string; byColumn?: Record<number, string> }) => {
      const terms = Object.values(payload.byColumn || {})
        .filter(Boolean)
        .join(" ")
        .trim();
      setSearchText(payload.global?.trim() || terms);
      setCurrentPage(1);
    },
    []
  );

  const getStatusDot = (status: boolean) => {
    switch (status) {
      case true:
        return <span className="status-dot green"></span>;
      case false:
        return <span className="status-dot red"></span>;
      default:
        return <span className="status-dot unknown"></span>;
    }
  };

  const columns = [
    { title: "ID", searchable: true },
    { title: "Emri", searchable: true },
    { title: "Email", searchable: true },
    { title: "Numri Telefonit", searchable: true },
    { title: "Statusi", searchable: true },
    { title: "Regjistruar", searchable: false },
  ];

  const filteredData = useMemo(() => data?.data || [], [data]);

  const rows = filteredData.map((client: any) => ({
    id: client.id,
    cells: [
      { content: client.id.slice(0, 6), searchText: client.id },
      {
        content: client.specialFields?.fullName || "-",
        searchText: client.specialFields?.fullName || "",
      },
      { content: client.email, searchText: client.email },
      {
        content: client.specialFields?.phone || "-",
        searchText: client.specialFields?.phone || "",
      },
      {
        content: (
          <div className="status-cell">
            {getStatusDot(client.isActivated)}
            {client.isActivated ? "Aktiv" : "Jo Aktiv"}
          </div>
        ),
        searchText: client.isActivated ? "Aktiv" : "Jo Aktiv",
      },
      {
        content: new Date(client.createdAt).toLocaleDateString("sq-AL"),
      },
    ],
  }));

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Klientët"}>
        <div className="salesWrapper">
          <div className="dashboardHeader">
            <div className="actionsHeaderButtonsLeft">
              <h2>Klientët Privat</h2>
            </div>
          </div>
          <Table
            columns={columns}
            rows={rows}
            enableSelection={false}
            onSearchChange={handleSearchChange}
            serverSideSearch
          />
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

export default Clients;
