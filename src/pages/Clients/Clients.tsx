import React, { useCallback, useMemo, useState } from "react";
import "./Clients.scss";
import Dashboard from "../../layouts/Dashboard";
import Table from "../../components/Table/Table";
import ActionsDropdown, { TableAction } from "../../components/ActionsDropdown/ActionsDropdown";
import useFetchData, { activateClient, deactivateClient, getClients } from "../../services/api";
import Pagination from "../../components/Pagination/Pagination";
import Loader from "../../components/Loader";
import useDebounce from "../../hooks/useDebounce";

const Clients = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>([]);
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

  const filteredData = useMemo(() => data?.data || [], [data]);

  const actions: TableAction[] = [
    { id: "activate", label: "Aktivizo të zgjedhurat", minSelected: 1 },
    { id: "deactivate", label: "Çaktivizo të zgjedhurat", minSelected: 1 },
    { id: "clear", label: "Pastro zgjedhjen", minSelected: 1 },
  ];

  const handleAction = async (actionId: string) => {
    if (actionId === "clear") {
      setSelectedRowIds([]);
      return;
    }

    const selectedClients = filteredData.filter((c: any) =>
      selectedRowIds.includes(c.id)
    );

    if (selectedClients.length === 0) return;

    if (actionId === "activate") {
      const ok = window.confirm(`Aktivizo ${selectedClients.length} klientë të zgjedhur?`);
      if (!ok) return;
      await Promise.all(selectedClients.map((c: any) => activateClient(c.id)));
    } else if (actionId === "deactivate") {
      const ok = window.confirm(`Çaktivizo ${selectedClients.length} klientë të zgjedhur?`);
      if (!ok) return;
      await Promise.all(selectedClients.map((c: any) => deactivateClient(c.id)));
    }

    setSelectedRowIds([]);
    window.location.reload();
  };

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
    { title: "ID", searchable: true, width: "8%" },
    { title: "Emri", searchable: true, width: "18%" },
    { title: "Email", searchable: true, width: "24%" },
    { title: "Numri Telefonit", searchable: true, width: "16%" },
    { title: "Statusi", searchable: true, width: "10%" },
    { title: "Regjistruar", searchable: false, width: "10%" },
  ];

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
              <div className="smsHeader">
                {totalItems > 0 && (
                  <span className="sms-credit-badge">
                    Klientë Privat: {totalItems} Llogari
                  </span>
                )}
              </div>
            </div>
            <div className="rightSide">
              <div className="rightSideActions">
                <ActionsDropdown
                  label="Veprime:"
                  actions={actions}
                  selectedCount={selectedRowIds.length}
                  onAction={handleAction}
                />
              </div>
            </div>
          </div>
          <Table
            columns={columns}
            rows={rows}
            enableSelection
            enableGlobalSearch={false}
            onSearchChange={handleSearchChange}
            serverSideSearch
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={({ selectedRowIds: ids }) =>
              setSelectedRowIds(ids)
            }
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
