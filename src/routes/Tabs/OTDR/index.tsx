import { NetworkIcon, SirenIcon } from "@phosphor-icons/react";
import { Button, InputNumber } from "antd";
import Select from "../../../components/Select";
import { useState, useEffect } from "react";
import { useApp } from "../../../context/appContext";
import { useNotification } from "../../../context/notificationContext";
import type { Options } from "../../../types/Common";
import type { OtdrCauses } from "../../../types/Causes";
import {
  mapOtdrEventToSeverity,
  type OtdrEvent,
} from "../../../utils/mapOtdrEventToSeverity";
import {
  type OtdrParams,
  getOtdrsFromProject,
  sendOtdrAlarm,
} from "../../../services/otdr";

const events: Options<OtdrCauses>[] = [
  {
    label: "Nenhuma falha detectada",
    value: "Clear",
  },
  { label: "Fiber cut", value: "Fiber cut" },
  { label: "Injection", value: "Injection" },
  { label: "Attenuation", value: "Attenuation" },
  { label: "Short event level", value: "Short event level" },
  { label: "Connector", value: "Connector" },
  {
    label: "Connector bending, dirty, loose",
    value: "Connector bending, dirty, loose",
  },
  { label: "Fiber bending", value: "Fiber bending" },
  {
    label: "Fiber bending on splice or connector",
    value: "Fiber bending on splice or connector",
  },
  { label: "Fiber break", value: "Fiber break" },
  {
    label: "Splice break or connector disconnected",
    value: "Splice break or connector disconnected",
  },
  {
    label: "Strong bend or connector disconnected",
    value: "Connector disconnected or strong bend",
  },
];

interface OtdrTabProps {
  isSelectedTab: boolean;
}

function OTDRTab({ isSelectedTab }: OtdrTabProps) {
  const [otdrs, setOtdrs] = useState<Options<string>[]>();
  const [otdrsData, setOtdrsData] = useState<Array<any>>();
  const [selectedOtdrs, setSelectedOtdrs] = useState<string[]>();
  const [selectedCause, setSelectedCause] = useState<OtdrEvent>(
    mapOtdrEventToSeverity["Clear"],
  );
  const [distance, setDistance] = useState("0");
  const [port, setPort] = useState("1");
  const [isLoadingOtdrs, setLoadingOtdrs] = useState(false);
  const [isLoadingPayload, setLoadingPayload] = useState(false);
  const { openNotification } = useNotification();
  const { env, token, tenantId, projectId, projectName } = useApp();

  useEffect(() => {
    if (!token || !tenantId || !projectId || !isSelectedTab) return;

    (async () => {
      setLoadingOtdrs(true);
      setSelectedOtdrs([]);

      const res = await getOtdrsFromProject({
        env,
        token,
        tenantId,
        projectId,
      });

      if (res.success) {
        const data = res.data ?? [];
        const options = data.map((otdr) => ({
          value: otdr.id,
          label: otdr.name,
        }));

        if (options.length === 0) {
          openNotification("info", { title: "Este projeto não possui OTDRs" });
        }
        setOtdrsData(data);
        setOtdrs(options);
      } else {
        openNotification("error", { title: "Erro!", description: res.message });
      }

      setLoadingOtdrs(false);
    })();
  }, [projectId, isSelectedTab]);

  useEffect(() => {
    selectedCause.name === "Clear" ? setDistance("0") : setDistance("0.01");
  }, [selectedCause.name]);

  const handleAlarm = async () => {
    if (!token || !tenantId) return;

    if (!selectedOtdrs || selectedOtdrs.length === 0) {
      openNotification("warning", { title: "Selecione ao menos um OTDR" });
      return;
    }
    setLoadingPayload(true);

    const promises = selectedOtdrs.map(async (otdrId) => {
      const otdrData = otdrsData?.find((o) => o.id === otdrId);

      const otdr: OtdrParams = {
        env,
        token,
        tenantId,
        projectId,
        projectName,
        otdrId,
        otdrName: otdrData?.name || "",
        severityName: selectedCause.severity.name,
        severityCode: selectedCause.severity.code,
        distance,
        eventName: selectedCause.name,
        eventCode: selectedCause.code,
        port,
        serialNumber: otdrData?.serial_number || "",
        formattedDesc: otdrData?.description || otdrData?.name || "",
      };

      return await sendOtdrAlarm(otdr);
    });

    const res = await Promise.all(promises);

    const successCount = res.filter((r) => r.success).length;
    const errorCount = res.filter((r) => !r.success).length;

    if (successCount > 0) {
      openNotification("success", {
        title: `${successCount} otdrs alarmados com sucesso!`,
      });
    }

    if (errorCount > 0) {
      openNotification("error", {
        title: `${errorCount} otdrs falharam ao alarmar!`,
      });
    }

    setLoadingPayload(false);
  };

  return (
    <>
      <div className="data">
        <p>OTDRs a serem alarmados:</p>
        <div className="data__select">
          <Select
            style={{ width: "60%" }}
            mode="multiple"
            loading={isLoadingOtdrs}
            disabled={!projectId || isLoadingOtdrs || isLoadingPayload}
            options={otdrs}
            value={selectedOtdrs}
            onChange={(e) => setSelectedOtdrs(e)}
          />
        </div>

        <div className="data__otdr">
          <div>
            <p>Causa:</p>
            <Select
              style={{ width: "100%" }}
              disabled={
                !selectedOtdrs || selectedOtdrs.length === 0 || isLoadingPayload
              }
              options={events}
              value={selectedCause.name}
              onChange={(e: OtdrCauses) =>
                setSelectedCause(mapOtdrEventToSeverity[e])
              }
            />
          </div>

          <div>
            <p>Distância (km):</p>
            <InputNumber
              classNames={{ root: "data__fields", input: "data__fields" }}
              mode="spinner"
              min={"0.01"}
              max={selectedCause.name === "Clear" ? "0" : "100"}
              step={0.01}
              value={distance}
              onChange={(e) => setDistance(e ?? "0.01")}
              stringMode
            />
          </div>

          <div>
            <p>Porta:</p>
            <InputNumber
              classNames={{
                root: "data__fields",
                input: "data__fields",
                actions: "data__fields__actions",
              }}
              prefix={<NetworkIcon size={15} />}
              min={"1"}
              max={"8"}
              value={port}
              onChange={(e) => setPort(e || "1")}
              stringMode
            />
          </div>
        </div>

        <div className="data__alarm">
          <Button
            loading={isLoadingPayload}
            disabled={!projectId || isLoadingPayload}
            onClick={() => handleAlarm()}
          >
            {!isLoadingPayload && <SirenIcon size={20} />}
          </Button>
        </div>
      </div>
    </>
  );
}

export default OTDRTab;
