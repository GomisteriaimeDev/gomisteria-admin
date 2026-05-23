import React, { useCallback, useMemo, useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import "./Products.scss";
import Table from "../../components/Table/Table";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import BlueButton from "../../components/BlueButton/BlueButton";
import useFetchData, { getProducts } from "../../services/api";
import capitalize from "../../utils/Capitalize";
import Pagination from "../../components/Pagination/Pagination";
import { useNavigate } from "react-router-dom";
import Loader from "../../components/Loader";
import ActionsDropdown, {
  TableAction,
} from "../../components/ActionsDropdown/ActionsDropdown";
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";

const getStatusParam = (option: string): string | undefined => {
  switch (option) {
    case "Në stok": return "in_stock";
    case "Nuk ka në stok": return "out_of_stock";
    default: return undefined;
  }
};

const Products = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("Të gjitha");
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 400);

  const statusParam = getStatusParam(selectedOption);
  const { data, isLoading } = useFetchData(
    getProducts,
    currentPage,
    10,
    undefined,
    statusParam,
    debouncedSearch || undefined
  );

  // Local UI state for actions (selection + optional local deletion demo)
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>(
    []
  );
  const [locallyDeletedIds, setLocallyDeletedIds] = useState<
    Set<string | number>
  >(new Set());

  const totalItems = data ? data.total : 0;
  const totalPages = Math.ceil(totalItems / 10);
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const navigate = useNavigate();

  const options = ["Të gjitha", "Në stok", "Nuk ka në stok"];

  const handleDropdownChange = (value: any) => {
    setSelectedOption(value);
    setCurrentPage(1);
  };

  const handleSearchChange = useCallback((payload: { global?: string; byColumn?: Record<number, string> }) => {
    const terms = Object.values(payload.byColumn || {}).filter(Boolean).join(' ').trim();
    setSearchText(payload.global?.trim() || terms);
    setCurrentPage(1);
  }, []);

  const handleRowClick = (id: any) => {
    navigate(`/product/${id}`);
  };

  const columns = [
    { title: "Prod. ID", searchable: true },
    { title: "Emri i Produktit", searchable: true },
    { title: "Marka", searchable: true },
    { title: "Kategoria", searchable: true },
    { title: "Çmimi", searchable: true },
    { title: "Statusi", searchable: true },
  ];

  const filteredData = useMemo(() => {
    const raw = data?.data || [];
    return raw.filter((p: any) => !locallyDeletedIds.has(p.id));
  }, [data, locallyDeletedIds]);

  // IMPORTANT: give rows an id so selection is stable
  const rows = useMemo(() => {
    return (filteredData || []).map((product: any) => ({
      id: product.id,
      cells: [
        {
          content: String(product.serialNumber).slice(0, 5),
          searchText: String(product.serialNumber),
        },
        {
          content: String(product.name).slice(0, 15),
          searchText: String(product.name),
        },
        { content: product.marka, searchText: product.marka },
        {
          content: capitalize(product.category),
          searchText: capitalize(product.category),
        },
        {
          content: `${product.salePrice ? product.salePrice : product.price}€`,
          searchText: `${
            product.salePrice ? product.salePrice : product.price
          }€`,
        },
        {
          content: product.stock > 0 ? "Në stok" : "Nuk ka në stok",
          searchText: product.stock > 0 ? "Në stok" : "Nuk ka në stok",
        },
      ],
      onClick: () => handleRowClick(product.id),
    }));
  }, [filteredData]);

  // Define actions for this page
  const actions: TableAction[] = [
    { id: "delete", label: "Fshij të zgjedhurat", minSelected: 1 },
    { id: "clear", label: "Pastro zgjedhjen", minSelected: 1 },
  ];

  const deleteMultipleProducts = async (productIds: any) => {
    try {
      await Promise.all(
        productIds.map((id: any) =>
          axios.delete(
            `https://gomisteria-api.onrender.com/api/products/${id}`,
            {
              headers: {
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
            }
          )
        )
      );
      alert("Produktet u fshinë me sukses.");
    } catch (error) {
      console.error("Gabim gjatë fshirjes së produkteve:", error);
      alert("Dështoi fshirja e disa produkteve.");
    }
  };

  const handleAction = (actionId: string) => {
    if (actionId === "clear") {
      setSelectedRowIds([]);
      return;
    }

    if (actionId === "delete") {
      const ok = window.confirm(
        `Fshij ${selectedRowIds.length} produkte të zgjedhura?`
      );
      if (!ok) return;

      deleteMultipleProducts(selectedRowIds).then(() => {
        setLocallyDeletedIds((prev) => {
          const next = new Set(prev);
          selectedRowIds.forEach((id) => next.add(id));
          return next;
        });
        setSelectedRowIds([]);
      });
      return;
    }

    if (actionId === "export") {
      // Export selected products from current filteredData
      const selected = (filteredData || []).filter((p: any) =>
        selectedRowIds.includes(p.id)
      );

      const blob = new Blob([JSON.stringify(selected, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `products_selected_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      return;
    }
  };

  return (
    <>
      <Loader isLoading={isLoading} />

      <Dashboard pageTitle={"Shitjet"}>
        <div className="salesWrapper">
          <div className="dashboardHeader">
            <h2>Produktet</h2>

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
                onAction={handleAction}
              />

              <div className="actionsHeaderButtons">
                <a href="/products/create">
                  <BlueButton>Shto Produkt</BlueButton>
                </a>
              </div>
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
            onSelectedRowIdsChange={({ selectedRowIds: ids }) =>
              setSelectedRowIds(ids)
            }
          />

          <div className="paginatoinSection">
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

export default Products;
