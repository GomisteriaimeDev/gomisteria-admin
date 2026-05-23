import React, { useCallback, useMemo, useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import "./Preorders.scss";
import Table from "../../components/Table/Table";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import ActionsDropdown, { TableAction } from "../../components/ActionsDropdown/ActionsDropdown";
import useFetchData, { getPreorders } from "../../services/api";
import Pagination from "../../components/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import formatDate from "../../utils/FormatDate";
import Loader from "../../components/Loader";
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";

type PreorderStatus = "PENDING" | "COMPLETED" | "CANCELLED";

const getStatusParam = (option: string): string | undefined => {
  switch (option) {
    case "Perfunduar": return "COMPLETED";
    case "Pending": return "PENDING";
    case "Anuluar": return "CANCELLED";
    default: return undefined;
  }
};

const Preorders = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("Të gjitha");
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 400);

  const statusParam = getStatusParam(selectedOption);
  const { data, isLoading } = useFetchData(getPreorders, currentPage, 10, "updatedAt", "desc", statusParam, debouncedSearch || undefined);

  const totalItems = data ? data.total : 0;
  const totalPages = Math.ceil(totalItems / 10);
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>([]);

  const navigate = useNavigate();

  const options = ["Të gjitha", "Perfunduar", "Pending", "Anuluar"];

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
    navigate(`/reservations/${id}`);
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

  const columns = [
    { title: "ID I Rezervimit", searchable: true },
    { title: "Emri i Plotë", searchable: true },
    { title: "Data", searchable: true },
    { title: "Ngarkesa", searchable: true },
    { title: "Çmimi", searchable: true },
    { title: "Statusi", searchable: true },
  ];

  const rows =
    filteredData?.map((preorder: any) => ({
      id: preorder.id,
      cells: [
        {
          content: `#${preorder.preOrderNumber}`,
          searchText: `#${preorder.preOrderNumber}`,
        },
        {
          content: preorder.fullName || preorder.user?.specialFields?.companyName,
          searchText: preorder.fullName || preorder.user?.specialFields?.companyName || "",
        },
        {
          content: `${formatDate(preorder.updatedAt)}`,
          searchText: `${formatDate(preorder.updatedAt)}`,
        },
        {
          content: preorder?.Ngarkesa?.title,
          searchText: preorder?.Ngarkesa?.title || "",
        },
        {
          content: `${Number(preorder.total ?? 0).toFixed(2)} €`,
          searchText: `${Number(preorder.total ?? 0).toFixed(2)} €`,
        },
        {
          content: (
            <div className="status-cell">
              {getStatusDot(preorder.status)}
              {preorder.status}
            </div>
          ),
          searchText: preorder.status,
        },
      ],
      onClick: () => handleRowClick(preorder.id),
    })) || [];

  const getToken = () => localStorage.getItem("token"); // adjust if needed

  // ✅ delete preorder
  const deletePreorderById = async (preorderId: string | number) => {
    if (!preorderId) return;
    const token = getToken();

    await axios.delete(
      `https://gomisteria-api.onrender.com/api/ngarkesa/preorder/${preorderId}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  const bulkDelete = async () => {
    const selected = filteredData.filter((p: any) => selectedRowIds.includes(p.id));
    if (selected.length === 0) {
      setSelectedRowIds([]);
      return;
    }

    const ok = window.confirm(
      `Fshij ${selected.length} rezervime të zgjedhura? Ky veprim nuk mund të zhbëhet.`
    );
    if (!ok) return;

    try {
      await Promise.all(selected.map((p: any) => deletePreorderById(p.id)));
      setSelectedRowIds([]);
      window.location.reload();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Ndodhi një gabim gjatë fshirjes së rezervimeve.");
    }
  };

  // ✅ update preorder status
  const updatePreorderStatusById = async (preorderId: string | number, status: PreorderStatus) => {
    if (!preorderId) return;
    const token = getToken();

    // Endpoint you provided: /ngarkesa/preorder/:id/status
    // NOTE: body/shape might differ in your backend; adjust as needed.
    await axios.patch(
      `https://gomisteria-api.onrender.com/api/ngarkesa/preorder/${preorderId}/status`,
      { status },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  const bulkUpdateStatus = async (status: PreorderStatus) => {
    const selected = filteredData.filter((p: any) => selectedRowIds.includes(p.id));
    if (selected.length === 0) {
      setSelectedRowIds([]);
      return;
    }

    const ok = window.confirm(
      `Ndrysho statusin në "${status}" për ${selected.length} rezervime të zgjedhura?`
    );
    if (!ok) return;

    try {
      await Promise.all(selected.map((p: any) => updatePreorderStatusById(p.id, status)));
      setSelectedRowIds([]);
      window.location.reload();
    } catch (error) {
      console.error("Bulk status update failed:", error);
      alert("Ndodhi një gabim gjatë përditësimit të statusit.");
    }
  };

  const actions: TableAction[] = [
    // ✅ status change actions
    { id: "mark_pending", label: "Shëno si: Pending", minSelected: 1 },
    { id: "mark_completed", label: "Shëno si: Perfunduar", minSelected: 1 },
    { id: "mark_cancelled", label: "Shëno si: Anuluar", minSelected: 1 },

    // ✅ delete + export + clear
    { id: "delete", label: "Fshij të zgjedhurat", minSelected: 1 },
    { id: "clear", label: "Pastro zgjedhjen", minSelected: 1 },
  ];

  const handleAction = async (actionId: string) => {
    if (actionId === "clear") {
      setSelectedRowIds([]);
      return;
    }

    if (actionId === "export") {
      const selected = filteredData.filter((p: any) => selectedRowIds.includes(p.id));
      const blob = new Blob([JSON.stringify(selected, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `preorders_selected_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (actionId === "delete") return bulkDelete();

    if (actionId === "mark_pending") return bulkUpdateStatus("PENDING");
    if (actionId === "mark_completed") return bulkUpdateStatus("COMPLETED");
    if (actionId === "mark_cancelled") return bulkUpdateStatus("CANCELLED");
  };

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Rezervimet"}>
        <div className="salesWrapper">
          <div className="dashboardHeader">
            <h2>Rezervimet</h2>
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
        </div>
      </Dashboard>
    </>
  );
};

export default Preorders;
