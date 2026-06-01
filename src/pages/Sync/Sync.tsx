import React, { useState } from "react";
import Dashboard from "../../layouts/Dashboard";
import "./Sync.scss";
import { syncProdataProducts } from "../../services/api";

type SyncResult = {
  synced: boolean;
  count: number;
  skipped?: boolean;
  lastSyncAt: number | null;
};

const formatDate = (ts: number | null) => {
  if (!ts) return "—";
  return new Date(ts).toLocaleString("sq-AL");
};

const Sync = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [result, setResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSync = async () => {
    setIsSyncing(true);
    setError(null);
    try {
      const data = await syncProdataProducts();
      setResult(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Sinkronizimi dështoi. Provoni përsëri."
      );
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Dashboard pageTitle={"Sinkronizimi"}>
      <div className="syncPage">
        <div className="dashboardHeader">
          <h2>Sinkronizimi i produkteve</h2>
        </div>

        <div className="syncCard">
          <p className="syncDescription">
            Produktet sinkronizohen automatikisht nga ProData çdo 10 minuta.
            Përdoreni butonin më poshtë për të sinkronizuar manualisht menjëherë
            pas një ndryshimi në sistem.
          </p>

          <button
            className="syncButton"
            onClick={handleSync}
            disabled={isSyncing}
          >
            {isSyncing ? "Duke sinkronizuar..." : "Sinkronizo tani"}
          </button>

          {error && <div className="syncAlert error">{error}</div>}

          {result && !error && (
            <div
              className={`syncAlert ${result.skipped ? "warning" : "success"}`}
            >
              {result.skipped ? (
                <>Një sinkronizim është tashmë në vazhdim. Provoni pas pak.</>
              ) : (
                <>
                  Sinkronizimi përfundoi me sukses — <b>{result.count}</b>{" "}
                  produkte u përditësuan.
                </>
              )}
              <div className="syncMeta">
                Sinkronizimi i fundit: {formatDate(result.lastSyncAt)}
              </div>
            </div>
          )}
        </div>
      </div>
    </Dashboard>
  );
};

export default Sync;
