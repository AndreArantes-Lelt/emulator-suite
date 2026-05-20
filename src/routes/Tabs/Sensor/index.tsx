import { SirenIcon } from "@phosphor-icons/react";
import { Select, Button } from "antd";
import { useState, useEffect } from "react";
import { useApp } from "../../../context/appContext";
import { useNotification } from "../../../context/notificationContext";
import {
  getSensorsFromProject,
  sendSensorAlarm,
} from "../../../services/sensor";

type SensorOptions = { value: string; label: string };

function SensorTab() {
  const [sensors, setSensors] = useState<SensorOptions[]>();
  const [selectedSensors, setSelectedSensors] = useState<string[]>();
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

  // TODO: get chosen sensors, their causes and alarm them
  // const handleAlarm = async () => {
  //   if (!token || !tenantId) return;

  //   (selectedSensors ?? []).map((sensor) => ({}));

  //   const res = await sendSensorAlarm(
  //     env,
  //     token,
  //     tenantId,
  //     sensor,
  //     "BATTERY_ALERT",
  //   );

  //   if (res.success) {
  //     openNotification("success", {
  //       title: "Sensor/sensores alarmados com sucesso!",
  //     });
  //   } else {
  //     openNotification("error", { title: "Erro!", description: res.message });
  //   }
  // };

  return (
    <>
      <div className="data">
        <p>Sensores a serem alarmados:</p>

        <div className="data__alarm">
          <Select
            classNames={{
              root: "data__fields",
              content: "data__fields",
            }}
            style={{ width: "60%" }}
            mode="multiple"
            showSearch={false}
            options={sensors}
            onSelect={(e) => setSelectedSensors(e)}
          />
          <Button onClick={() => handleAlarm()}>
            <SirenIcon size={20} />
          </Button>
        </div>
      </div>
    </>
  );
}

export default SensorTab;
