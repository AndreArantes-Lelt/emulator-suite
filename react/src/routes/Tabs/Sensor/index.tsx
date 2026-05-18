import { Select } from "antd";
import { useState } from "react";
import TenantForm from "../../../components/TenantForm";

function SensorTab() {
  const [sensors, setSensors] = useState<string[] | null>();

  return (
    <>
      <TenantForm />
      <div className="data">
        <p>Sensores a serem alarmados:</p>
        <Select
          classNames={{
            root: "data__fields",
            content: "data__fields",
          }}
          mode="multiple"
          style={{ width: "60%" }}
          value={sensors}
          onChange={(e) => setSensors(e)}
          // options={}
        />
      </div>
    </>
  );
}

export default SensorTab;
