import { useCallback, useEffect, useMemo, useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import "./Businesses.scss";
import Table from "../../components/Table/Table";
import FilterDropdown from "../../components/FilterDropdown/FilterDropdown";
import ActionsDropdown, {
  TableAction,
} from "../../components/ActionsDropdown/ActionsDropdown";
import useFetchData, {
  activateBusiness,
  deactivateBusiness,
  forceActivateBusiness,
  getBusinesses,
  getBusinessCountsByType,
  getSmsCredit,
  getSmsIntlCredit,
} from "../../services/api";
import send from "../../assets/svg/send.svg";
import message from "../../assets/svg/message-square.svg";
import BusinessMessage from "./BusinessMessage";
import Pagination from "../../components/Pagination/Pagination";
import Loader from "../../components/Loader";
import axios from "axios";
import useDebounce from "../../hooks/useDebounce";

const getStatusParam = (option: string): string | undefined => {
  switch (option) {
    case "Aktive":
      return "active";
    case "Jo Aktive":
      return "inactive";
    default:
      return undefined;
  }
};

const Businesses = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedOption, setSelectedOption] = useState("Të gjitha");
  const [searchText, setSearchText] = useState("");
  const debouncedSearch = useDebounce(searchText, 400);

  const statusParam = getStatusParam(selectedOption);
  const { data, isLoading } = useFetchData(
    getBusinesses,
    currentPage,
    10,
    "updatedAt",
    "desc",
    statusParam,
    debouncedSearch || undefined,
  );

  const totalItems = data ? data.total : 0;
  const totalPages = Math.ceil(totalItems / 10);
  const paginate = (pageNumber: any) => setCurrentPage(pageNumber);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [messageType, setMessageType] = useState<"email" | "phone">("email");
  const [messageBusinessIds, setMessageBusinessIds] = useState<
    string[] | undefined
  >(undefined);
  const [messageRecipients, setMessageRecipients] = useState<
    { id: string; companyName: string; phone: string }[] | undefined
  >(undefined);

  const [smsCredit, setSmsCredit] = useState<string | null>(null);
  const [smsIntlCredit, setSmsIntlCredit] = useState<string | null>(null);
  const [businessTypeCounts, setBusinessTypeCounts] = useState<{ type: string; count: number }[]>([]);


  const fetchSmsCredit = useCallback(async () => {
    try {
      const [local, intl, typeCounts] = await Promise.all([
        getSmsCredit(),
        getSmsIntlCredit(),
        getBusinessCountsByType(),
      ]);
      setSmsCredit(local);
      setSmsIntlCredit(intl);
      if (typeCounts) setBusinessTypeCounts(typeCounts);
    } catch (error) {
      console.error("Failed to fetch SMS credit:", error);
    }
  }, []);

  useEffect(() => {
    fetchSmsCredit();
  }, [fetchSmsCredit]);

  // NEW: controlled selection for table
  const [selectedRowIds, setSelectedRowIds] = useState<Array<string | number>>(
    [],
  );

  const options = ["Të gjitha", "Aktive", "Jo Aktive"];

  const handleDropdownChange = (value: any) => {
    setSelectedOption(value);
    setCurrentPage(1);
  };

  const handleSearchChange = useCallback(
    (payload: { global?: string; byColumn?: Record<number, string> }) => {
      const terms = Object.values(payload.byColumn || {})
        .filter(Boolean)
        .join(" ")
        .trim();
      setSearchText(payload.global?.trim() || terms);
      setCurrentPage(1);
    },
    [],
  );

  const openBusinessMessage = (
    type: "email" | "phone",
    businesses?: any[],
  ) => {
    setMessageType(type);
    if (businesses && businesses.length > 0) {
      setMessageBusinessIds(businesses.map((b: any) => b.id));
      setMessageRecipients(
        businesses.map((b: any) => ({
          id: b.id,
          companyName: b.specialFields?.companyName || "",
          phone: b.specialFields?.phone || "",
        })),
      );
    } else {
      setMessageBusinessIds(undefined);
      setMessageRecipients(undefined);
    }
    setIsModalOpen(true);
  };

  const filteredData = useMemo(() => {
    return data?.data || [];
  }, [data]);

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
    { title: "Emri i Kompanisë", searchable: true },
    { title: "ARBK Numri", searchable: true },
    { title: "Industria", searchable: true },
    { title: "Email", searchable: true },
    { title: "Numri i Telefonit", searchable: true },
    { title: "Statusi", searchable: true },
  ];

  // Build rows with a stable id for selection
  const rows =
    filteredData?.map((business: any) => ({
      id: business.id, // NEW
      business, // keep original reference if you want it elsewhere
      cells: [
        { content: business.id.slice(0, 5), searchText: business.id },
        {
          content: business.specialFields.companyName,
          searchText: business.specialFields.companyName,
        },
        {
          content: business.specialFields.nrARBK,
          searchText: business.specialFields.nrARBK,
        },
        {
          content: business.specialFields.businessType,
          searchText: business.specialFields.businessType,
        },
        { content: business.email, searchText: business.email },
        {
          content: business.specialFields.phone,
          searchText: business.specialFields.phone,
        },
        {
          content: (
            <div className="status-cell">
              {getStatusDot(business.isActivated)}
              {business.isActivated ? "Aktive" : "Jo Aktive"}
            </div>
          ),
          searchText: business.isActivated ? "Aktive" : "Jo Aktive",
        },
      ],
    })) || [];

  const handleActivate = async (business: any) => {
    try {
      await activateBusiness(business);
    } catch (error) {
      console.error("There was an error approving the business:", error);
      alert("An error occurred while approving the business.");
    }
  };

  const handleForceActivate = async (business: any) => {
    try {
      await forceActivateBusiness(business);
    } catch (error) {
      console.error("There was an error fully activating the business:", error);
      alert("An error occurred while fully activating the business.");
    }
  };

  const handleDeactivate = async (business: any) => {
    try {
      await deactivateBusiness(business);
    } catch (error) {
      console.error("There was an error deapproving the business:", error);
      alert("An error occurred while deapproving the business.");
    }
  };
  const deleteBusinessById = async (businessId: string | number) => {
    if (!businessId) return;

    const token = localStorage.getItem("token");

    await axios.delete(
      `https://gomisteria-api.onrender.com/api/users/businesses/${businessId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );
  };
  // NEW: actions dropdown for selected rows (1+)
  const actions: TableAction[] = [
    { id: "activate", label: "Aktivizo të zgjedhurat", minSelected: 1 },
    {
      id: "force-activate",
      label: "Aktivizo plotësisht (telefon + email)",
      minSelected: 1,
    },
    { id: "deactivate", label: "Çaktivizo të zgjedhurat", minSelected: 1 },
    { id: "delete", label: "Fshij të zgjedhurat", minSelected: 1 },
    { id: "send-email", label: "Dërgo email të zgjedhurave", minSelected: 1 },
    {
      id: "send-message",
      label: "Dërgo mesazh të zgjedhurave",
      minSelected: 1,
    },
    { id: "clear", label: "Pastro zgjedhjen", minSelected: 1 },
  ];

  const handleAction = async (actionId: string) => {
    if (actionId === "clear") {
      setSelectedRowIds([]);
      return;
    }

    const selectedBusinesses = filteredData.filter((b: any) =>
      selectedRowIds.includes(b.id),
    );

    if (selectedBusinesses.length === 0) {
      setSelectedRowIds([]);
      return;
    }

    if (actionId === "activate") {
      const ok = window.confirm(
        `Aktivizo ${selectedBusinesses.length} biznese të zgjedhura?`,
      );
      if (!ok) return;

      await Promise.all(selectedBusinesses.map((b: any) => handleActivate(b)));

      // simplest approach consistent with your existing logic:
      window.location.reload();
      return;
    }

    if (actionId === "force-activate") {
      const ok = window.confirm(
        `Aktivizo plotësisht ${selectedBusinesses.length} biznese? Telefoni dhe email-i do të shënohen si të verifikuar.`,
      );
      if (!ok) return;

      await Promise.all(
        selectedBusinesses.map((b: any) => handleForceActivate(b)),
      );

      window.location.reload();
      return;
    }

    if (actionId === "deactivate") {
      const ok = window.confirm(
        `Çaktivizo ${selectedBusinesses.length} biznese të zgjedhura?`,
      );
      if (!ok) return;

      await Promise.all(
        selectedBusinesses.map((b: any) => handleDeactivate(b)),
      );

      window.location.reload();
      return;
    }
    if (actionId === "send-email") {
      openBusinessMessage("email", selectedBusinesses);
      return;
    }

    if (actionId === "send-message") {
      openBusinessMessage("phone", selectedBusinesses);
      return;
    }

    if (actionId === "delete") {
      const ok = window.confirm(
        `Fshij ${selectedBusinesses.length} biznese të zgjedhura? Ky veprim nuk mund të zhbëhet.`,
      );
      if (!ok) return;

      try {
        await Promise.all(
          selectedBusinesses.map((b: any) => deleteBusinessById(b.id)),
        );

        setSelectedRowIds([]);

        window.location.reload();
      } catch (error) {
        console.error("Error deleting businesses:", error);
        alert("Dështoi fshirja e disa bizneseve.");
      }
      return;
    }
  };

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Bizneset"}>
        <div className="salesWrapper">
          <div className="dashboardHeader">
            <div className="actionsHeaderButtonsLeft">
              <h2>Bizneset</h2>
              <div className="smsHeader">
                {businessTypeCounts.map(({ type, count }) => (
                  <span key={type} className="sms-credit-badge">
                    Biznes {type}: {count} Llogari
                  </span>
                ))}
                {smsCredit !== null && (
                  <span className="sms-credit-badge">
                    SMS Kredit: {smsCredit}
                  </span>
                )}
                {smsIntlCredit !== null && (
                  <span className="sms-credit-badge">
                    SMS Intl Kredit: {smsIntlCredit}
                  </span>
                )}
              </div>
            </div>

            <div className="rightSide">
              <div className="sendingMail">
                <div
                  className="sendingMailItem"
                  onClick={() => openBusinessMessage("email")}
                >
                  <img src={send} alt="" />
                  <p>Dërgoni Email për të gjithë</p>
                </div>
              </div>

              <div className="rightSideActions">
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
                  onAction={(id) => {
                    // ensure async handled safely
                    handleAction(id);
                  }}
                />

                <div className="sendingMail">
                  <div
                    className="sendingMailItem"
                    onClick={() => openBusinessMessage("phone")}
                  >
                    <img src={message} alt="" />
                    <p>Dërgo mesazh për të gjitha</p>
                  </div>
                </div>
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

          <div className="paginationSection">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={paginate}
            />
          </div>

          {isModalOpen && (
            <BusinessMessage
              onClose={() => {
                setIsModalOpen(false);
                fetchSmsCredit();
              }}
              messageType={messageType}
              businessIds={messageBusinessIds}
              recipients={messageRecipients}
            />
          )}

        </div>
      </Dashboard>
    </>
  );
};

export default Businesses;
