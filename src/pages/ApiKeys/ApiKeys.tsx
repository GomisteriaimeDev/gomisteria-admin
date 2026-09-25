import React, { useCallback, useEffect, useMemo, useState } from "react";
import "./ApiKeys.scss";
import Dashboard from "../../layouts/Dashboard";
import Table from "../../components/Table/Table";
import Loader from "../../components/Loader";
import {
  getApiKeys,
  createApiKey,
  updateApiKey,
  regenerateApiKey,
  deleteApiKey,
  getFeedReport,
} from "../../services/api";

type ApiKeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  discountPercent: number;
  isActive: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

type FormState = {
  id: string | null;
  name: string;
  discountPercent: string;
  isActive: boolean;
};

const EMPTY_FORM: FormState = {
  id: null,
  name: "",
  discountPercent: "",
  isActive: true,
};

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleString("sq-AL") : "Asnjëherë";

const ApiKeys = () => {
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [report, setReport] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [isSaving, setIsSaving] = useState(false);

  // The plaintext key, held only long enough for the admin to copy it. It is never
  // returned again by any endpoint.
  const [issuedKey, setIssuedKey] = useState<{ name: string; key: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [confirm, setConfirm] = useState<
    { action: "delete" | "regenerate"; row: ApiKeyRow } | null
  >(null);

  const loadKeys = useCallback(async () => {
    try {
      const data = await getApiKeys();
      setKeys(Array.isArray(data) ? data : []);
      setError(null);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Nuk u ngarkuan partnerët.");
    }
  }, []);

  // The report walks the whole catalogue, so it must never block the key list.
  const loadReport = useCallback(async () => {
    try {
      setReport(await getFeedReport());
    } catch {
      setReport(null);
    }
  }, []);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await loadKeys();
      setIsLoading(false);
      loadReport();
    })();
  }, [loadKeys, loadReport]);

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const openEdit = (row: ApiKeyRow) => {
    setForm({
      id: row.id,
      name: row.name,
      discountPercent: String(row.discountPercent ?? 0),
      isActive: row.isActive,
    });
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const validate = (): string | null => {
    if (!form.name.trim()) return "Emri i partnerit është i detyrueshëm.";
    const percent = parseFloat(form.discountPercent);
    if (!Number.isFinite(percent) || percent < 0 || percent > 100) {
      return "Zbritja duhet të jetë një numër mes 0 dhe 100.";
    }
    return null;
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        discountPercent: parseFloat(form.discountPercent),
      };

      if (isEditing && form.id) {
        await updateApiKey(form.id, { ...payload, isActive: form.isActive });
        setIsFormOpen(false);
      } else {
        const created = await createApiKey(payload);
        setIsFormOpen(false);
        // Show the key before anything else can navigate away from it.
        if (created?.key) setIssuedKey({ name: created.name, key: created.key });
      }

      await loadKeys();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Ruajtja dështoi.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    const { action, row } = confirm;
    setConfirm(null);
    setError(null);

    try {
      if (action === "delete") {
        await deleteApiKey(row.id);
      } else {
        const result = await regenerateApiKey(row.id);
        if (result?.key) setIssuedKey({ name: result.name, key: result.key });
      }
      await loadKeys();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Veprimi dështoi.");
    }
  };

  const copyKey = async () => {
    if (!issuedKey) return;
    try {
      await navigator.clipboard.writeText(issuedKey.key);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const columns = [
    { title: "Partneri", searchable: true, width: "22%" },
    { title: "Çelësi", searchable: true, width: "18%" },
    { title: "Zbritja", searchable: false, width: "10%" },
    { title: "Statusi", searchable: false, width: "12%" },
    { title: "Përdorur së fundi", searchable: false, width: "18%" },
    { title: "Veprime", searchable: false, width: "20%" },
  ];

  const rows = useMemo(
    () =>
      keys.map((row) => ({
        id: row.id,
        cells: [
          { content: row.name, searchText: row.name },
          {
            content: <code className="keyPrefix">{row.keyPrefix}…</code>,
            searchText: row.keyPrefix,
          },
          { content: <strong>{row.discountPercent}%</strong> },
          {
            content: (
              <span className={row.isActive ? "statusActive" : "statusInactive"}>
                {row.isActive ? "Aktiv" : "Joaktiv"}
              </span>
            ),
          },
          { content: formatDate(row.lastUsedAt) },
          {
            content: (
              <div className="rowActions">
                <button type="button" onClick={() => openEdit(row)}>
                  Ndrysho
                </button>
                <button
                  type="button"
                  onClick={() => setConfirm({ action: "regenerate", row })}
                >
                  Rigjenero
                </button>
                <button
                  type="button"
                  className="danger"
                  onClick={() => setConfirm({ action: "delete", row })}
                >
                  Fshij
                </button>
              </div>
            ),
          },
        ],
      })),
    [keys]
  );

  return (
    <>
      <Loader isLoading={isLoading} />
      <Dashboard pageTitle={"Partnerët API"}>
        <div className="apiKeysWrapper">
          <div className="dashboardHeader">
            <h2>Partnerët API</h2>
            <button type="button" className="primaryAction" onClick={openCreate}>
              + Partner i ri
            </button>
          </div>

          {error && <div className="apiKeysError">{error}</div>}

          {report && (
            <div className="feedSummary">
              <div className="feedStat">
                <span className="feedStatValue">{report.eligible}</span>
                <span className="feedStatLabel">Produkte në feed</span>
              </div>
              <div className="feedStat">
                <span className="feedStatValue">{report.excluded}</span>
                <span className="feedStatLabel">Të përjashtuara</span>
              </div>
              <div className="feedStat">
                <span className="feedStatValue">{report.totalCatalogueItems}</span>
                <span className="feedStatLabel">Gjithsej në katalog</span>
              </div>
              {report.exclusionsByReason?.length > 0 && (
                <div className="feedReasons">
                  <h4>Arsyet kryesore të përjashtimit</h4>
                  <ul>
                    {report.exclusionsByReason
                      .slice(0, 5)
                      .map((reason: any) => (
                        <li key={reason.reason}>
                          <span>{reason.label}</span>
                          <strong>{reason.count}</strong>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <Table columns={columns} rows={rows} enableGlobalSearch={false} />

          {keys.length === 0 && !isLoading && (
            <p className="apiKeysEmpty">
              Asnjë partner ende. Krijo një çelës për ta lidhur një treg si Gjirafa.
            </p>
          )}
        </div>
      </Dashboard>

      {/* Create / edit */}
      {isFormOpen && (
        <div className="modal">
          <div className="modalContent">
            <h3>{isEditing ? "Përditëso Partnerin" : "Krijo Partner"}</h3>

            <label>Emri i partnerit</label>
            <input
              type="text"
              value={form.name}
              placeholder="p.sh. Gjirafa"
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />

            <label>Zbritja (%)</label>
            <input
              type="number"
              min={0}
              max={100}
              step="0.01"
              value={form.discountPercent}
              placeholder="30"
              onChange={(e) =>
                setForm({ ...form, discountPercent: e.target.value })
              }
            />

            {isEditing && (
              <label className="checkboxRow">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({ ...form, isActive: e.target.checked })
                  }
                />
                Aktiv
              </label>
            )}

            <div className="modalActions">
              <button type="button" onClick={() => setIsFormOpen(false)}>
                Anulo
              </button>
              <button
                type="button"
                className="primaryAction"
                disabled={isSaving}
                onClick={handleSave}
              >
                {isSaving ? "Duke ruajtur…" : "Ruaj"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/*
        Key reveal. Deliberately has no backdrop-click or escape close: the plaintext
        key is shown exactly once and cannot be recovered, so dismissing it must be a
        deliberate act.
      */}
      {issuedKey && (
        <div className="modal">
          <div className="modalContent keyReveal">
            <h3>Çelësi për {issuedKey.name}</h3>
            <p className="keyWarning">
              Ruaje tani. Ky çelës nuk shfaqet më kurrë. Nëse humbet, duhet ta
              rigjenerosh.
            </p>
            <div className="keyBox">
              <code>{issuedKey.key}</code>
            </div>
            <div className="modalActions">
              <button type="button" onClick={copyKey}>
                {copied ? "U kopjua" : "Kopjo"}
              </button>
              <button
                type="button"
                className="primaryAction"
                onClick={() => {
                  setIssuedKey(null);
                  setCopied(false);
                }}
              >
                E ruajta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destructive confirmations */}
      {confirm && (
        <div className="modal">
          <div className="modalContent">
            <h3>
              {confirm.action === "delete" ? "Fshij partnerin?" : "Rigjenero çelësin?"}
            </h3>
            <p className="confirmText">
              {confirm.action === "delete"
                ? `“${confirm.row.name}” nuk do të ketë më qasje në feed.`
                : `Çelësi aktual i “${confirm.row.name}” ndalon së punuari menjëherë dhe krijohet një i ri.`}
            </p>
            <div className="modalActions">
              <button type="button" onClick={() => setConfirm(null)}>
                Anulo
              </button>
              <button type="button" className="danger" onClick={handleConfirm}>
                {confirm.action === "delete" ? "Fshij" : "Rigjenero"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ApiKeys;
