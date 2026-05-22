import { MagnifyingGlassIcon, CaretDownIcon } from "@phosphor-icons/react";
import { Input, Button, Select } from "antd";
import { useState } from "react";
import { getProjects } from "../../services/projects";
import { useApp } from "../../context/appContext";
import { useNotification } from "../../context/notificationContext";
import "./styles.scss";

type ProjectOptions = { value: string; label: string };

function ProjectSelect() {
  const [projectOptions, setProjectOptions] = useState<ProjectOptions[]>();
  const [isLoading, setLoading] = useState(false);
  const { openNotification } = useNotification();
  const { env, token, tenantId, setTenantId, setProjectId } = useApp();

  const handleProjects = async () => {
    if (!token) {
      openNotification("error", { title: "Você precisa estar logado" });
      return;
    }

    if (!tenantId) {
      openNotification("warning", { title: "Informe o tenant id" });
      return;
    }

    setLoading(true);
    setTenantId(tenantId);

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
      setLoading(false);
    } else {
      openNotification("error", { title: "Erro!", description: res.message });
      setProjectOptions([]);
      setLoading(false);
    }
  };

  return (
    <div className="project">
      <div className="project__tenant">
        <Input
          placeholder="Tenant ID"
          className="project__fields"
          onChange={(e) => setTenantId(e.target.value)}
        />

        <Button loading={isLoading} onClick={() => handleProjects()}>
          {!isLoading && <MagnifyingGlassIcon size={20} />}
        </Button>
      </div>

      <Select
        placeholder="Projeto"
        classNames={{
          root: "project__fields",
          content: "project__fields",
        }}
        suffixIcon={
          <CaretDownIcon size={20} style={{ color: "var(--white)" }} />
        }
        disabled={!tenantId}
        options={projectOptions}
        onChange={(e) => setProjectId(e)}
      ></Select>
    </div>
  );
}

export default ProjectSelect;
