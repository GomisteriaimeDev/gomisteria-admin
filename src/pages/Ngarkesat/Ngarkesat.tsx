import React, { useCallback, useMemo, useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import "./Ngarkesat.scss";
import Table from "../../components/Table/Table";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import ActionsDropdown, { TableAction } from "../../components/ActionsDropdown/ActionsDropdown";
import BlueButton from "../../components/BlueButton/BlueButton";
import useFetchData, { getNgarkesat } from "../../services/api";
import Pagination from "../../components/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import formatDate from "../../utils/FormatDate";
import NgarkesaModal from "./NgarkesaModal";
import Loader from "../../components/Loader";

// ✅ add axios for delete (change API link if needed)
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";

const getStatusParam = (option: string): string | undefined => {
  switch (option) {
    case "Aktive": return "active";
    case "Arritur": return "arrived";
    default: return undefined;
  }
};

const Ngarkesat = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("Të gjitha");
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 400);

  const statusParam = getStatusParam(selectedOption);
  const { data, isLoading } = useFetchData(getNgarkesat, currentPage, 10, "updatedAt", "desc", statusParam, debouncedSearch || undefined);

  const totalItems = data ? data.total : 0;
  const totalPages = Math.ceil(totalItems / 10);

  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // controlled selection
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>([]);

  const navigate = useNavigate();

  const options = ["Të gjitha", "Aktive", "Arritur"];

  const handleDropdownChange = (value: any) => {
    setSelectedOption(value);
    setCurrentPage(1);
  };

  const handleSearchChange = useCallback((payload: { global?: string; byColumn?: Record<number, string> }) => {
    const terms = Object.values(payload.byColumn || {}).filter(Boolean).join(' ').trim();
    setSearchText(payload.global?.trim() || terms);
    setCurrentPage(1);
  }, []);

  const filteredData = useMemo(() => {
    return data?.data || [];
  }, [data]);

  const handleRowClick = (id: any) => {
    navigate(`/loads/${id}`);
  };

  const columns = [
    { title: "Emri i ngarkesës", searchable: true },
    { title: "U krijua", searchable: true },
    { title: "Pritet të arrijë", searchable: true },
    { title: "Statusi", searchable: true },
  ];

  const getStatusDot = (arrivalTime: string) => {
    const isArrived = new Date(arrivalTime) <= new Date();
    return isArrived ? <span className="status-dot green"></span> : <span className="status-dot yellow"></span>;
  };

  const rows =
    filteredData?.map((ngarkesa: any) => ({
      id: ngarkesa.id,
      cells: [
        {
          content: ngarkesa.title ? ngarkesa.title : "",
          searchText: ngarkesa.title || "",
        },
        {
          content: formatDate(ngarkesa.createdAt),
          searchText: formatDate(ngarkesa.createdAt),
        },
        {
          content: formatDate(ngarkesa.arrivalTime),
          searchText: formatDate(ngarkesa.arrivalTime),
        },
        {
          content: (
            <div className="status-cell">
              {getStatusDot(ngarkesa.arrivalTime)}
              {new Date(ngarkesa.arrivalTime) <= new Date() ? "Arritur" : "Aktive"}
            </div>
          ),
          searchText: new Date(ngarkesa.arrivalTime) <= new Date() ? "Arritur" : "Aktive",
        },
      ],
      onClick: () => handleRowClick(ngarkesa.id),
    })) || [];

  const handleModalOpen = () => setIsModalOpen(true);
  const handleModalClose = () => setIsModalOpen(false);

  const getToken = () => localStorage.getItem("token"); // adjust if needed

  // ✅ delete by id (replace endpoint if needed)
  const deleteNgarkesaById = async (ngarkesaId: string | number) => {
    if (!ngarkesaId) return;

    const token = getToken();

    await axios.delete(`https://gomisteria-api.onrender.com/api/ngarkesa/${ngarkesaId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const bulkDelete = async () => {
    const selected = filteredData.filter((n: any) => selectedRowIds.includes(n.id));
    if (selected.length === 0) {
      setSelectedRowIds([]);
      return;
    }

    const ok = window.confirm(
      `Fshij ${selected.length} ngarkesa të zgjedhura? Ky veprim nuk mund të zhbëhet.`
    );
    if (!ok) return;

    try {
      await Promise.all(selected.map((n: any) => deleteNgarkesaById(n.id)));
      setSelectedRowIds([]);
      window.location.reload();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Ndodhi një gabim gjatë fshirjes së ngarkesave.");
    }
  };

  const actions: TableAction[] = [
    { id: "delete", label: "Fshij të zgjedhurat", minSelected: 1 }, // ✅ added
    { id: "clear", label: "Pastro zgjedhjen", minSelected: 1 },
  ];

  const handleAction = async (actionId: string) => {
    if (actionId === "clear") {
      setSelectedRowIds([]);
      return;
    }

    if (actionId === "export") {
      const selected = filteredData.filter((n: any) => selectedRowIds.includes(n.id));

      const blob = new Blob([JSON.stringify(selected, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ngarkesat_selected_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (actionId === "delete") {
      return bulkDelete();
    }
  };

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Ngarkesat"}>
        <div className="salesWrapper">
          <div className="dashboardHeader">
            <div className="actionsHeaderButtonsLeft">
              <h2>Ngarkesat</h2>
              <BlueButton onClick={handleModalOpen}>Shto Ngarkesë</BlueButton>
            </div>

            <div className="actionsHeader">
              <FilterDropdown
                label="Shfaq:"
                options={options}
                selectedValue={selectedOption}
                onChange={handleDropdownChange}
              />

              <ActionsDropdown
                label="Veprime:"
                actions={actions}
                selectedCount={selectedRowIds.length}
                onAction={(id) => handleAction(id)}
              />
            </div>
          </div>

          <Table
            columns={columns}
            rows={rows}
            enableSelection
            enableColumnSearch
            enableGlobalSearch={false}
            serverSideSearch
            onSearchChange={handleSearchChange}
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={({ selectedRowIds: ids }) => setSelectedRowIds(ids)}
          />

          <div className="paginationSection">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={paginate} />
          </div>

          <NgarkesaModal isOpen={isModalOpen} onClose={handleModalClose} />
        </div>
      </Dashboard>
    </>
  );
};

export default Ngarkesat;
