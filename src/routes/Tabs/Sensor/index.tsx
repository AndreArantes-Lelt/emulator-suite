import { CaretDownIcon, SirenIcon } from "@phosphor-icons/react";
import { Select, Button } from "antd";
import { useState, useEffect } from "react";
import { useApp } from "../../../context/appContext";
import { useNotification } from "../../../context/notificationContext";
import {
  type SensorParams,
  getSensorsFromProject,
  sendSensorAlarm,
} from "../../../services/sensor";

type SensorOptions = { value: string; label: string };

function SensorTab() {
  const [sensors, setSensors] = useState<SensorOptions[]>();
  const [selectedSensors, setSelectedSensors] = useState<string[]>();
  const [isLoading, setLoading] = useState(false);
  const { openNotification } = useNotification();
  const { env, token, tenantId, projectId } = useApp();

  useEffect(() => {
    if (!token || !tenantId || !projectId) return;

    (async () => {
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
    })();
  }, [projectId]);

  const handleAlarm = async () => {
    if (!token || !tenantId) return;

    if (!selectedSensors || selectedSensors.length === 0) {
      openNotification("warning", { title: "Selecione ao menos um sensor" });
      return;
    }
    setLoading(true);

    // TODO: get choosen cause
    const promises = selectedSensors.map(async (sensorId) => {
      const sensor: SensorParams = {
        env,
        token,
        tenantId,
        devEui: sensorId,
        cause: "BATTERY_ALERT",
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
        <div className="data__select">
          <p>Sensores a serem alarmados:</p>
          <Select
            classNames={{
              root: "data__fields",
              content: "data__fields",
            }}
            suffixIcon={
              <CaretDownIcon size={20} style={{ color: "var(--white)" }} />
            }
            disabled={!projectId}
            style={{ width: "60%" }}
            mode="multiple"
            showSearch={false}
            options={sensors}
            onChange={(e) => setSelectedSensors(e)}
          />
          <p>Causa:</p>
        </div>

        <div className="data__alarm">
          <Select
            classNames={{
              root: "data__fields",
              content: "data__fields",
            }}
            suffixIcon={
              <CaretDownIcon size={20} style={{ color: "var(--white)" }} />
            }
            disabled={!projectId}
            style={{ width: "35%" }}
          />

          <Button
            loading={isLoading}
            disabled={!projectId}
            onClick={() => handleAlarm()}
          >
            {!isLoading && <SirenIcon size={20} />}
          </Button>
        </div>
      </div>
    </>
  );
}

export default SensorTab;
