import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input, Button, Select } from "antd";
import { useState } from "react";
import { getProjects } from "../../services/projects";
import { useApp } from "../../context/appContext";
import { useNotification } from "../../context/notificationContext";
import "./styles.scss";

type ProjectOptions = { value: string; label: string };

function ProjectSelect() {
  const [projectOptions, setProjectOptions] = useState<ProjectOptions[]>();
  const { openNotification } = useNotification();
  const { env, token, setTenantId, setProjectId } = useApp();

  const handleProjects = async () => {
    const data = document.getElementById("tenant_id") as HTMLInputElement;
    const tenantId = data.value.trim();
    setTenantId(tenantId);

    if (!token) {
      openNotification("error", { title: "Você precisa estar logado" });
      return;
    }

    if (!tenantId) {
      openNotification("warning", { title: "Informe o tenant id" });
      return;
    }

    const res = await getProjects({
      env,
      token,
      tenantId,
    });

    if (res.success) {
      const options = (res.data ?? []).map((project) => ({
        value: project.id,
        label: project.name,
      }));
      setProjectOptions(options);
    } else {
      openNotification("error", { title: "Erro!", description: res.message });
    }
  };

  return (
    <div className="project">
      <div className="project__tenant">
        <Input
          placeholder="Tenant ID"
          id="tenant_id"
          className="project__fields"
        />

        <Button onClick={() => handleProjects()}>
          <MagnifyingGlassIcon size={20} />
        </Button>
      </div>

      <Select
        placeholder="Projeto"
        classNames={{
          root: "project__fields",
          content: "project__fields",
        }}
        options={projectOptions}
        onSelect={(e) => setProjectId(e)}
      ></Select>
    </div>
  );
}

export default ProjectSelect;
