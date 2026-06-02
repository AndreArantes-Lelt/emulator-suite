import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input, Button } from "antd";
import Select from "../Select";
import { useState, useEffect } from "react";
import { type ProjectResponse, getProjects } from "../../services/projects";
import { useApp } from "../../context/appContext";
import { useNotification } from "../../context/notificationContext";
import type { Options } from "../../types/Common";
import "./styles.scss";

function ProjectSelect() {
  const [projects, setProjects] = useState<Options<string>[]>();
  const [isLoading, setLoading] = useState(false);
  const { openNotification } = useNotification();
  const { env, token, tenantId, projectId, setTenantId, setProject } = useApp();

  useEffect(() => {
    setProjects([]);
    setProject({ id: null, name: null });
  }, [tenantId]);

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
        value: project.id ?? "",
        label: project.name ?? "",
      }));

      if (options.length === 0) {
        openNotification("info", { title: "Este tenant não possui projetos" });
      }
      setProjects(options);
    } else {
      openNotification("error", { title: "Erro!", description: res.message });
    }

    setLoading(false);
  };

  const handleSelectedProject = (selected: string) => {
    const selectedProject = projects?.find((opt) => opt.value === selected);
    const project: ProjectResponse = {
      id: selectedProject?.value ?? "",
      name: selectedProject?.label ?? "",
    };

    setProject(project);
  };

  return (
    <div className="project">
      <div className="project__tenant">
        <Input
          placeholder="Tenant ID"
          className="project__fields"
          disabled={isLoading}
          onChange={(e) => setTenantId(e.target.value)}
        />

        <Button loading={isLoading} onClick={() => handleProjects()}>
          {!isLoading && <MagnifyingGlassIcon size={20} />}
        </Button>
      </div>

      <Select
        placeholder="Projeto"
        disabled={projects?.length === 0 || isLoading}
        value={projectId}
        options={projects}
        onChange={(e) => handleSelectedProject(e)}
      />
    </div>
  );
}

export default ProjectSelect;
