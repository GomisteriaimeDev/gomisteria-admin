import React, { useCallback, useMemo, useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import "./Services.scss";
import Table from "../../components/Table/Table";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import ActionsDropdown, {
  TableAction,
} from "../../components/ActionsDropdown/ActionsDropdown";

import useFetchData, { approveService, getServiceOrders } from "../../services/api";
import capitalize from "../../utils/Capitalize";
import Pagination from "../../components/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import formatDate from "../../utils/FormatDate";
import ApprovalModal from "./ApprovalModal";
import Loader from "../../components/Loader";

// ✅ add axios for delete (you said you'll change API link yourself)
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";

const getStatusParam = (option: string): string | undefined => {
  switch (option) {
    case "E Paguar": return "paid";
    case "Aktive": return "active";
    case "Jo Aktive": return "inactive";
    case "Perfunduar": return "completed";
    default: return undefined;
  }
};

const Services = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("Të gjitha");
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 400);

  const statusParam = getStatusParam(selectedOption);
  const { data, isLoading } = useFetchData(
    getServiceOrders,
    currentPage,
    10,
    "updatedAt",
    "desc",
    statusParam,
    debouncedSearch || undefined
  );

  const totalItems = data ? data.total : 0;
  const totalPages = Math.ceil(totalItems / 10);

  const [showModal, setShowModal] = useState(false);
  const [selectedServiceOrder, setSelectedServiceOrder] = useState<any>(null);

  // controlled selection
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>([]);

  const navigate = useNavigate();

  const options = ["Të gjitha", "Aktive", "Jo Aktive", "E Paguar", "Perfunduar"];

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
    navigate(`/services/${id}`);
  };

  const getStatusDot = (status: any) => {
    switch (status) {
      case "completed":
        return <span className="status-dot lightBlue"></span>;
      case "paid":
        return <span className="status-dot green"></span>;
      case "active":
        return <span className="status-dot yellow"></span>;
      case "inactive":
        return <span className="status-dot red"></span>;
      default:
        return <span className="status-dot unknown"></span>;
    }
  };

  const columns = [
    { title: "Numri i porosisë", searchable: true },
    { title: "Service Type", searchable: true },
    { title: "Emri i plotë", searchable: true },
    { title: "Industria", searchable: true },
    { title: "Deadline", searchable: true },
    { title: "Statusi", searchable: true },
  ];

  const openModal = (serviceOrder: any) => {
    setSelectedServiceOrder(serviceOrder);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedServiceOrder(null);
  };

  const handleApprove = async (id: any, status: any) => {
    try {
      await approveService(id, status);
      window.location.reload();
      closeModal();
    } catch (error) {
      console.error(`Failed to update service order status: ${id}`, error);
    }
  };

  // bulk status update
  const bulkUpdateStatus = async (
    status: "paid" | "active" | "inactive" | "completed"
  ) => {
    const selected = filteredData.filter((s: any) => selectedRowIds.includes(s.id));
    if (selected.length === 0) {
      setSelectedRowIds([]);
      return;
    }

    const ok = window.confirm(
      `Ndrysho statusin në "${status}" për ${selected.length} porosi të zgjedhura?`
    );
    if (!ok) return;

    try {
      await Promise.all(selected.map((s: any) => approveService(s.id, status)));
      setSelectedRowIds([]);
      window.location.reload();
    } catch (error) {
      console.error("Bulk update failed:", error);
      alert("Ndodhi një gabim gjatë përditësimit të porosive.");
    }
  };

  // ✅ NEW: bulk delete (change URL yourself)
  const deleteServiceOrderById = async (serviceOrderId: string | number) => {
    if (!serviceOrderId) return;

    const token = localStorage.getItem("token"); // adjust if your token key differs

    await axios.delete(`https://gomisteria-api.onrender.com/api/service-orders/${serviceOrderId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  };

  const bulkDelete = async () => {
    const selected = filteredData.filter((s: any) => selectedRowIds.includes(s.id));
    if (selected.length === 0) {
      setSelectedRowIds([]);
      return;
    }

    const ok = window.confirm(
      `Fshij ${selected.length} porosi shërbimi të zgjedhura? Ky veprim nuk mund të zhbëhet.`
    );
    if (!ok) return;

    try {
      await Promise.all(selected.map((s: any) => deleteServiceOrderById(s.id)));
      setSelectedRowIds([]);
      window.location.reload();
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert("Ndodhi një gabim gjatë fshirjes së porosive.");
    }
  };

  const actions: TableAction[] = [
    { id: "mark_paid", label: "Shëno si: E Paguar", minSelected: 1 },
    { id: "mark_active", label: "Shëno si: Aktive", minSelected: 1 },
    { id: "mark_inactive", label: "Shëno si: Jo Aktive", minSelected: 1 },
    { id: "mark_completed", label: "Shëno si: Perfunduar", minSelected: 1 },

    // ✅ added delete
    { id: "delete", label: "Fshij të zgjedhurat", minSelected: 1 },

    { id: "clear", label: "Pastro zgjedhjen", minSelected: 1 },
  ];

  const handleAction = async (actionId: string) => {
    if (actionId === "clear") {
      setSelectedRowIds([]);
      return;
    }
    if (actionId === "mark_paid") return bulkUpdateStatus("paid");
    if (actionId === "mark_active") return bulkUpdateStatus("active");
    if (actionId === "mark_inactive") return bulkUpdateStatus("inactive");
    if (actionId === "mark_completed") return bulkUpdateStatus("completed");
    if (actionId === "delete") return bulkDelete();
  };

  const rows =
    filteredData?.map((service: any) => ({
      id: service.id, // required for selection
      cells: [
        { content: `#${service.id.slice(0, 5)}`, searchText: `#${service.id.slice(0, 5)}` },
        { content: service.Service.name, searchText: service.Service.name },
        {
          content:
            service?.User?.specialFields?.fullName ||
            service?.User?.specialFields?.companyName,
          searchText:
            service?.User?.specialFields?.fullName ||
            service?.User?.specialFields?.companyName ||
            "",
        },
        {
          content: service.Business.specialFields.businessType,
          searchText: service.Business.specialFields.businessType,
        },
        {
          content: `${service.ora} ${formatDate(service.data)}`,
          searchText: `${service.ora} ${formatDate(service.data)}`,
        },
        {
          content: (
            <div className="status-cell">
              {getStatusDot(service.status)}
              {capitalize(service.status)}
            </div>
          ),
          searchText: service.status,
        },
      ],
      // keep single-item approval modal behavior:
      onClick: () => openModal(service),
      // or if you want details navigation instead:
      // onClick: () => handleRowClick(service.id),
    })) || [];

  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Shërbimet"}>
        <div className="salesWrapper">
          <div className="dashboardHeader">
            <h2>Shërbimet</h2>
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

          <ApprovalModal
            show={showModal}
            onClose={closeModal}
            serviceOrder={selectedServiceOrder}
            onApprove={handleApprove}
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

export default Services;
