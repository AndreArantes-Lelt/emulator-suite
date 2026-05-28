import {
  SirenIcon,
  ArrowsClockwiseIcon,
  SwapIcon,
} from "@phosphor-icons/react";
import { Button, Checkbox, InputNumber } from "antd";
import Select from "../../../components/Select";
import { useState, useEffect } from "react";
import { useApp } from "../../../context/appContext";
import { useNotification } from "../../../context/notificationContext";
import type { Options } from "../../../types/Utils";
import type { SensorCauses } from "../../../types/Causes";
import {
  type SensorParams,
  getSensorsFromProject,
  sendSensorAlarm,
} from "../../../services/sensor";

const causes: Options<SensorCauses>[] = [
  { label: "Keep alive", value: "KEEP_ALIVE" },
  { label: "Potencia ótica", value: "OPTICAL_POWER_ALERT" },
  { label: "Temperatura", value: "TEMPERATURE_ALERT" },
  { label: "Bateria", value: "BATTERY_ALERT" },
];

function SensorTab() {
  const [sensors, setSensors] = useState<Options<string>[]>();
  const [selectedSensors, setSelectedSensors] = useState<string[]>();
  const [selectedCause, setSelectedCause] =
    useState<SensorCauses>("KEEP_ALIVE");
  const [isPayloadLoopMode, setPayloadLoopMode] = useState(false);
  const [isCauseLoopMode, setCauseLoopMode] = useState(false);
  const [payloadLoop, setPayloadLoop] = useState(0);
  const [payloadDelay, setPayloadDelay] = useState(0);
  const [isLoadingSensors, setLoadingSensors] = useState(false);
  const [isLoadingPayload, setLoadingPayload] = useState(false);
  const { openNotification } = useNotification();
  const { env, token, tenantId, projectId } = useApp();

  useEffect(() => {
    if (!isPayloadLoopMode) {
      setPayloadLoop(2);
      setPayloadDelay(0.2);
      setCauseLoopMode(false);
    }
  }, [isPayloadLoopMode]);

  useEffect(() => {
    if (!selectedSensors || selectedSensors.length === 0) {
      setPayloadLoopMode(false);
    }
  }, [selectedSensors]);

  useEffect(() => {
    if (!token || !tenantId || !projectId) return;

    (async () => {
      setLoadingSensors(true);
      setSelectedSensors([]);

      const res = await getSensorsFromProject({
        env,
        token,
        tenantId,
        projectId,
      });

      if (res.success) {
        const options = (res.data ?? []).map((sensor) => ({
          value: sensor.id,
          label: sensor.name,
        }));

        if (options.length === 0) {
          openNotification("info", {
            title: "Este projeto não possui sensores",
          });
        }
        setSensors(options);
      } else {
        openNotification("error", { title: "Erro!", description: res.message });
      }

      setLoadingSensors(false);
    })();
  }, [projectId]);

  const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const handleAlarm = async () => {
    if (!token || !tenantId) return;

    if (!selectedSensors || selectedSensors.length === 0) {
      openNotification("warning", { title: "Selecione ao menos um sensor" });
      return;
    }
    setLoadingPayload(true);

    let successCount = 0,
      errorCount = 0;

    for (let i = 0; i < (isPayloadLoopMode ? payloadLoop : 1); i++) {
      const promises = selectedSensors.map(async (sensorId) => {
        const sensor: SensorParams = {
          env,
          token,
          tenantId,
          devEui: sensorId,
          cause: isCauseLoopMode && i % 2 === 0 ? "KEEP_ALIVE" : selectedCause,
        };

        return await sendSensorAlarm(sensor);
      });

      const res = await Promise.all(promises);

      successCount += res.filter((r) => r.success).length;
      errorCount += res.filter((r) => !r.success).length;

      if (isPayloadLoopMode && i < payloadLoop - 1) {
        await delay(payloadDelay * 1000);
      }
    }

    if (successCount > 0) {
      openNotification("success", {
        title: `${successCount} pacotes enviados com sucesso!`,
      });
    }

    if (errorCount > 0) {
      openNotification("error", {
        title: `${errorCount} pacotes enviados falharam!`,
      });
    }

    setLoadingPayload(false);
  };

  return (
    <>
      <div className="data">
        <p>Sensores a serem alarmados:</p>
        <div className="data__select">
          <Select
            style={{ width: "60%" }}
            mode="multiple"
            loading={isLoadingSensors}
            disabled={!projectId || isLoadingSensors || isLoadingPayload}
            value={selectedSensors}
            options={sensors}
            onChange={(e) => setSelectedSensors(e)}
          />
        </div>

        <p>Causa:</p>
        <div className="data__alarm">
          <Select
            style={{ width: "35%" }}
            disabled={
              !selectedSensors ||
              selectedSensors.length === 0 ||
              isLoadingPayload
            }
            value={selectedCause}
            options={causes}
            onChange={(e: SensorCauses) => setSelectedCause(e)}
          />

          <Button
            loading={isLoadingPayload}
            disabled={!projectId || isLoadingPayload}
            onClick={() => handleAlarm()}
          >
            {!isLoadingPayload && <SirenIcon size={20} />}
          </Button>
        </div>

        <Checkbox
          classNames={{
            root: "checkbox",
            label: "checkbox__label",
          }}
          disabled={
            !selectedSensors || selectedSensors.length === 0 || isLoadingPayload
          }
          checked={isPayloadLoopMode}
          onChange={(e) => setPayloadLoopMode(e.target.checked)}
        >
          <ArrowsClockwiseIcon weight="bold" size={20} />
          Teste de carga (Loop)
        </Checkbox>

        {isPayloadLoopMode && (
          <div className="data__loop">
            <div>
              <p>Repetições:</p>
              <InputNumber
                classNames={{ root: "data__fields", input: "data__fields" }}
                mode="spinner"
                min={2}
                max={50}
                value={payloadLoop}
                onChange={(e) => setPayloadLoop(e ?? 2)}
              />

              <Checkbox
                classNames={{
                  root: "checkbox",
                  label: "checkbox__label",
                }}
                checked={isCauseLoopMode}
                onChange={(e) => setCauseLoopMode(e.target.checked)}
              >
                <SwapIcon size={20} />
                Alternar keep alive
              </Checkbox>
            </div>

            <div>
              <p>Delay entre payloads (seg):</p>
              <InputNumber
                classNames={{ root: "data__fields", input: "data__fields" }}
                mode="spinner"
                min={0.2}
                max={60}
                step={0.01}
                value={payloadDelay}
                onChange={(e) => setPayloadDelay(e ?? 0.2)}
              />
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default SensorTab;
