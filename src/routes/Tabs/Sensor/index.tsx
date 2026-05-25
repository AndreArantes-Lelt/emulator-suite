import { SirenIcon, ArrowsClockwiseIcon } from "@phosphor-icons/react";
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
  const [selectedCause, setSelectedCause] = useState<SensorCauses>("KEEP_ALIVE");
  const [isPayloadLoop, setPayloadLoop] = useState(false);
  const [isLoadingSensors, setLoadingSensors] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const { openNotification } = useNotification();
  const { env, token, tenantId, projectId } = useApp();

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
        setSensors(options);
      } else {
        openNotification("error", { title: "Erro!", description: res.message });
      }

      setLoadingSensors(false);
    })();
  }, [projectId]);

  const handleAlarm = async () => {
    if (!token || !tenantId) return;

    if (!selectedSensors || selectedSensors.length === 0) {
      openNotification("warning", { title: "Selecione ao menos um sensor" });
      return;
    }
    setLoading(true);

    const promises = selectedSensors.map(async (sensorId) => {
      const sensor: SensorParams = {
        env,
        token,
        tenantId,
        devEui: sensorId,
        cause: selectedCause,
      };

      return await sendSensorAlarm(sensor);
    });

    const res = await Promise.all(promises);

    const successCount = res.filter((r) => r.success).length;
    const errorCount = res.filter((r) => !r.success).length;

    if (successCount > 0) {
      openNotification("success", {
        title: `${successCount} sensores alarmados com sucesso!`,
      });
    }

    if (errorCount > 0) {
      openNotification("error", {
        title: `${errorCount} sensores falharam ao alarmar!`,
      });
    }

    setLoading(false);
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
            disabled={!projectId}
            value={selectedSensors}
            options={sensors}
            onChange={(e) => setSelectedSensors(e)}
          />
        </div>

        <p>Causa:</p>
        <div className="data__alarm">
          <Select
            style={{ width: "35%" }}
            disabled={selectedSensors?.length === 0}
            value={selectedCause}
            options={causes}
            onChange={(e: SensorCauses) => setSelectedCause(e)}
          />

          <Button loading={isLoading} disabled={!projectId} onClick={() => handleAlarm()}>
            {!isLoading && <SirenIcon size={20} />}
          </Button>
        </div>

        <Checkbox
          classNames={{
            root: "checkbox",
            label: "checkbox__label",
          }}
          onChange={(e) => setPayloadLoop(e.target.checked)}
        >
          <ArrowsClockwiseIcon weight="bold" size={20} />
          Teste de carga (Loop)
        </Checkbox>

        {isPayloadLoop && (
          <div className="data__loop">
            <InputNumber
              className="data__fields"
              mode="spinner"
              placeholder="Repetições"
            />
            <InputNumber
              classNames={{ root: "data__fields" }}
              mode="spinner"
              placeholder="Delay entre payloads"
            />
          </div>
        )}
      </div>
    </>
  );
}

export default SensorTab;
