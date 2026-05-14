import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input, Button, Select } from "antd";
import "./styles.scss";

function TenantForm() {
  return (
    <div className="tenant">
      <div className="tenant__search">
        <Input placeholder="Tenant ID" className="tenant__fields" />

        <Button type="primary" htmlType="submit">
          <MagnifyingGlassIcon size={20} />
        </Button>
      </div>

      <Select
        placeholder="Projeto"
        classNames={{
          root: "tenant__fields",
          content: "tenant__fields",
        }}
      ></Select>
    </div>
  );
}

export default TenantForm;
