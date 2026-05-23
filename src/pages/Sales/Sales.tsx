// src/pages/Sales/Sales.tsx
import React, { useEffect, useMemo, useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import "./Sales.scss";
import Table from "../../components/Table/Table";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import ActionsDropdown, {
  TableAction,
} from "../../components/ActionsDropdown/ActionsDropdown";
import BulkAssignEmployeeDropdown from "../../components/BulkAssignEmployeeDropdown/BulkAssignEmployeeDropdown";
import {
  getOrders,
  getOrderById,
  deleteOrder,
  updateOrderStatus,
  getEmployeesList,
  assignOrderToEmployee,
} from "../../services/api";
import { useNavigate } from "react-router-dom";
import capitalize from "../../utils/Capitalize";
import Loader from "../../components/Loader";
import UpdateStatusModal from "./UpdateStatusModal";
import Pagination from "../../components/Pagination/Pagination";

import { PDFDocument } from "pdf-lib";

const formatDate = (v: any) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString();
};

const ORDERS_PER_PAGE = 10;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const base64ToUint8Array = (base64: string) => {
  const byteChars = atob(base64);
  const bytes = new Uint8Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) bytes[i] = byteChars.charCodeAt(i);
  return bytes;
};

const blobToObjectUrl = (blob: Blob) => URL.createObjectURL(blob);

const downloadBlob = (blob: Blob, filename: string) => {
  const url = blobToObjectUrl(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const printBlob = async (blob: Blob) => {
  const url = blobToObjectUrl(blob);

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  iframe.src = url;

  document.body.appendChild(iframe);

  await new Promise<void>((resolve, reject) => {
    iframe.onload = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
        resolve();
      } catch (e) {
        reject(e);
      }
    };
    iframe.onerror = () =>
      reject(new Error("Failed to load merged PDF in iframe"));
  });

  // give print dialog time to appear, then cleanup
  await sleep(800);

  document.body.removeChild(iframe);
  URL.revokeObjectURL(url);
};

/**
 * Merge multiple base64 PDFs (orders) into ONE PDF blob.
 * - Skips orders without pdfBase64.
 * - Preserves page order based on `selectedOrders` order.
 */
const mergeSelectedOrdersToPdfBlob = async (selectedOrders: any[]) => {
  const merged = await PDFDocument.create();
  let addedPages = 0;

  for (const order of selectedOrders) {
    const b64 = order?.pdfBase64;
    if (!b64) {
      console.warn(`Porosia ${order?.id} nuk ka PDF të disponueshëm.`);
      continue;
    }

    const srcBytes = base64ToUint8Array(b64);
    const srcDoc = await PDFDocument.load(srcBytes);

    const pageIndices = srcDoc.getPageIndices();
    const pages = await merged.copyPages(srcDoc, pageIndices);
    pages.forEach((p) => merged.addPage(p));
    addedPages += pages.length;
  }

  if (addedPages === 0) {
    return { blob: null as Blob | null, addedPages: 0 };
  }

  const outBytes = await merged.save();
  const blob = new Blob([outBytes], { type: "application/pdf" });
  return { blob, addedPages };
};

// Albanian status options (value is enum, label is UI)
const statusOptions = [
  { value: "ALL", label: "Të gjitha" },
  { value: "CREATED", label: "Krijuar" },
  { value: "PROCESSING", label: "Në Proces" },
  { value: "SHIPPED", label: "Transportuar" },
  { value: "DELIVERED", label: "Kompletuar" },
  { value: "CANCELLED", label: "Anuluar" },
  { value: "BORXH", label: "Borxh" },
] as const;

const STATUS_LABELS: Record<string, string> = {
  CREATED: "Krijuar",
  PROCESSING: "Në Proces",
  SHIPPED: "Transportuar",
  DELIVERED: "Kompletuar",
  CANCELLED: "Anuluar",
  BORXH: "Borxh",
};

const getStatusLabel = (status?: string) => {
  if (!status) return "";
  return STATUS_LABELS[status] ?? status;
};

const Sales = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);

  // keep enum filter value, not label
  const [selectedOption, setSelectedOption] = useState<string>("ALL");
  const [orders, setOrders] = useState<any[]>([]);
  const [totalOrders, setTotalOrders] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>(
    []
  );

  const [employees, setEmployees] = useState<any[]>([]);
  const [isAssigningEmployee, setIsAssigningEmployee] = useState(false);

  const navigate = useNavigate();

  const totalPages = Math.ceil(totalOrders / ORDERS_PER_PAGE);

  const handleRowClick = (id: any) => navigate(`/sales/${id}`);

  const columns = [
    { title: "Numri i porosisë", searchable: true },
    { title: "Data e porosisë", searchable: true },
    { title: "Lloji i llogarisë", searchable: true },
    { title: "Emri i plotë", searchable: true },
    { title: "Çmimi", searchable: true },
    { title: "Qyteti", searchable: true },
    { title: "Punetori", searchable: true },
    { title: "Statusi", searchable: true },
  ];

  const getStatusDot = (status: string) => {
    switch (status) {
      case "CREATED":
        return <span className="status-dot lightBlue"></span>;
      case "PROCESSING":
      case "SHIPPED":
        return <span className="status-dot yellow"></span>;
      case "DELIVERED":
        return <span className="status-dot green"></span>;
      case "CANCELLED":
        return <span className="status-dot red"></span>;
      case "BORXH":
        return <span className="status-dot orange"></span>;
      default:
        return <span className="status-dot unknown"></span>;
    }
  };

  // Fetch orders with server-side pagination & status filter
  const fetchOrders = async (page: number, status: string) => {
    setIsLoading(true);
    try {
      const statusParam = status === "ALL" ? undefined : status;
      const res = await getOrders(page, ORDERS_PER_PAGE, "updatedAt", "desc", statusParam);
      setOrders(Array.isArray(res?.data) ? res.data : []);
      setTotalOrders(res?.total ?? 0);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders(currentPage, selectedOption);
  }, [currentPage, selectedOption]);

  // Fetch employees for the dropdown
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await getEmployeesList();
        if (!cancelled) setEmployees(res?.data || []);
      } catch (e) {
        if (!cancelled) console.error("Failed to fetch employees:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const rows = useMemo(() => {
    return (orders || []).map((order: any) => {
      const orderNumber = `#${order.orderNumber ?? ""}`;
      const orderDate = formatDate(
        order.createdAt ?? order.updatedAt ?? order.date
      );

      const accountType = capitalize(
        order?.user?.specialFields?.businessType || order?.user?.role || ""
      );

      const fullName =
        order.fullName || order?.user?.specialFields?.companyName || "";

      const total = `${Number(order.total ?? 0).toFixed(2)}€`;
      const city = order?.user?.specialFields?.city ?? "";

      // avoid crash when employee is not assigned
      const employeeName = order?.employee?.specialFields?.fullName ?? "";

      const status = order?.status ?? "";
      const statusLabel = getStatusLabel(status);

      return {
        id: order.id,
        cells: [
          { content: orderNumber, searchText: orderNumber },
          { content: orderDate, searchText: orderDate },
          {
            content: <div className="colored-cell">{accountType}</div>,
            searchText: accountType,
          },
          { content: fullName, searchText: fullName },
          {
            content: <div className="colored-cell">{total}</div>,
            searchText: total,
          },
          { content: city, searchText: city },
          { content: employeeName, searchText: employeeName },
          {
            content: (
              <div className="status-cell">
                {getStatusDot(status)}
                {statusLabel}
              </div>
            ),
            // search in Albanian
            searchText: statusLabel,
          },
        ],
        onClick: () => handleRowClick(order.id),
      };
    });
  }, [orders, navigate]);

  const actions: TableAction[] = [
    { id: "clear", label: "Pastro zgjedhjen", minSelected: 1 },
    { id: "delete", label: "Fshij të zgjedhurat", minSelected: 1 },
    { id: "updateStatus", label: "Përditëso statusin", minSelected: 1 },
    { id: "downloadPDFs", label: "Shkarko PDF-të", minSelected: 1 },
    { id: "printPDFs", label: "Printo PDF-të", minSelected: 1 },
  ];

  const handleAction = async (actionId: string) => {
    if (actionId === "clear") {
      setSelectedRowIds([]);
      return;
    }

    if (actionId === "delete") {
      const ok = window.confirm(
        `Fshij ${selectedRowIds.length} porosi të zgjedhura?`
      );
      if (!ok) return;

      try {
        await Promise.all(selectedRowIds.map((id) => deleteOrder(id)));
        setSelectedRowIds([]);
        alert("Porositë u fshinë me sukses.");
        fetchOrders(currentPage, selectedOption);
      } catch (error) {
        console.error("Gabim gjatë fshirjes së porosive:", error);
        alert("Dështoi fshirja e disa porosive.");
      }
      return;
    }

    if (actionId === "export") {
      const selected = orders.filter((o: any) => selectedRowIds.includes(o.id));
      const blob = new Blob([JSON.stringify(selected, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `sales_selected_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }

    if (actionId === "updateStatus") {
      setIsUpdateStatusModalOpen(true);
      return;
    }

    if (actionId === "downloadPDFs") {
      try {
        setIsLoading(true);

        const selected = await Promise.all(
          selectedRowIds.map((id) => getOrderById(id))
        );
        const { blob, addedPages } = await mergeSelectedOrdersToPdfBlob(
          selected
        );

        if (!blob || addedPages === 0) {
          alert("Asnjë PDF nuk u gjet për porositë e zgjedhura.");
          return;
        }

        downloadBlob(blob, `invoices-merged-${Date.now()}.pdf`);
        alert("PDF i bashkuar u shkarkua me sukses.");
      } catch (e) {
        console.error("Gabim gjatë bashkimit/shkarkimit të PDF-ve:", e);
        alert("Dështoi bashkimi/shkarkimi i PDF-ve.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (actionId === "printPDFs") {
      try {
        setIsLoading(true);

        const selected = await Promise.all(
          selectedRowIds.map((id) => getOrderById(id))
        );
        const { blob, addedPages } = await mergeSelectedOrdersToPdfBlob(
          selected
        );

        if (!blob || addedPages === 0) {
          alert("Asnjë PDF nuk u gjet për porositë e zgjedhura.");
          return;
        }

        await printBlob(blob);
      } catch (e) {
        console.error("Gabim gjatë bashkimit/printimit të PDF-ve:", e);
        alert("Dështoi bashkimi/printimi i PDF-ve.");
      } finally {
        setIsLoading(false);
      }
      return;
    }
  };

  const handleUpdateStatus = (newStatus: string) => {
    Promise.all(selectedRowIds.map((id) => updateOrderStatus(id, newStatus)))
      .then(() => {
        alert("Statuset e porosive u përditësuan me sukses.");
        setSelectedRowIds([]);
        fetchOrders(currentPage, selectedOption);
      })
      .catch((error) => {
        console.error("Gabim gjatë përditësimit të statuseve:", error);
        alert("Dështoi përditësimi i disa statuseve.");
      });
  };

  const handleBulkAssignEmployee = async ({
    employeeId,
  }: {
    employeeId: string;
  }) => {
    if (!employeeId) return;
    if (selectedRowIds.length === 0) {
      alert("Zgjidh së paku një porosi para se të caktoni punonjës.");
      return;
    }

    const ok = window.confirm(
      `Cakto punonjësin për ${selectedRowIds.length} porosi të zgjedhura?`
    );
    if (!ok) return;

    try {
      setIsAssigningEmployee(true);

      await Promise.all(
        selectedRowIds.map((orderId) =>
          assignOrderToEmployee({ orderId, employeeId })
        )
      );

      // Optional local UI sync (if you keep employee object in response, you can refresh instead)
      setOrders((prev) =>
        prev.map((o) =>
          selectedRowIds.includes(o.id) ? { ...o, employeeId } : o
        )
      );

      alert("Punonjësi u caktua me sukses.");
      window.location.reload();
      setSelectedRowIds([]);
    } catch (e) {
      console.error("Failed bulk assign employee:", e);
      alert("Dështoi caktimi i punonjësit për disa porosi.");
    } finally {
      setIsAssigningEmployee(false);
    }
  };

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Shitjet"}>
        <div className="salesWrapper">
          <div className="dashboardHeader">
            <h2>Shitjet</h2>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <FilterDropdown
                label="Shfaq:"
                options={statusOptions.map((o) => o.label)}
                selectedValue={
                  statusOptions.find((o) => o.value === selectedOption)
                    ?.label ?? "Të gjitha"
                }
                onChange={(label: string) => {
                  const found = statusOptions.find((o) => o.label === label);
                  setSelectedOption(found?.value ?? "ALL");
                  setCurrentPage(1);
                }}
              />

              <BulkAssignEmployeeDropdown
                label="Punëtorët:"
                employees={employees}
                selectedCount={selectedRowIds.length}
                onAssign={handleBulkAssignEmployee}
                placeholder={
                  isAssigningEmployee ? "Duke caktuar..." : "Zgjidh punonjës..."
                }
              />

              <ActionsDropdown
                label="Veprime:"
                actions={actions}
                selectedCount={selectedRowIds.length}
                onAction={handleAction}
              />
            </div>
          </div>

          <Table
            columns={columns}
            rows={rows}
            enableSelection
            enableColumnSearch
            enableGlobalSearch={false}
            selectedRowIds={selectedRowIds}
            onSelectedRowIdsChange={({ selectedRowIds: ids }) =>
              setSelectedRowIds(ids)
            }
          />

          <div className="paginatoinSection">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page: number) => setCurrentPage(page)}
            />
          </div>

          <UpdateStatusModal
            isOpen={isUpdateStatusModalOpen}
            onClose={() => setIsUpdateStatusModalOpen(false)}
            onUpdate={handleUpdateStatus}
            selectedOrders={orders.filter((o) => selectedRowIds.includes(o.id))}
          />
        </div>
      </Dashboard>
    </>
  );
};

export default Sales;
