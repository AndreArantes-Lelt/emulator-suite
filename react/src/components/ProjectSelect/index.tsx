import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { Input, Button, Select } from "antd";
import { getProjects } from "../../services/projects";
import { useAuth } from "../../context/authContext";
import { useNotification } from "../../context/notificationContext";
import "./styles.scss";

function ProjectSelect() {
  const { openNotification } = useNotification();
  const { env, token } = useAuth();

  const handleProjects = async () => {
    const data = document.getElementById(
      "tenant_id",
    ) as HTMLInputElement | null;
    const tenantId = data?.value?.trim();

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
      tenantId,
      token,
    });

    if (res) {
      console.log("Success");
    } else {
      openNotification("error", {
        title: "Erro!",
        description: "Não foi possivel recuperar os projetos.",
      });
    }
  };

  return (
    <div className="tenant">
      <div className="tenant__search">
        <Input
          placeholder="Tenant ID"
          id="tenant_id"
          className="tenant__fields"
        />

        <Button onClick={() => handleProjects()}>
          <MagnifyingGlassIcon size={20} />
        </Button>
      </div>

      <Select
        placeholder="Projeto"
        classNames={{
          root: "tenant__fields",
          content: "tenant__fields",
        }}
        // options={}
      ></Select>
    </div>
  );
}

export default ProjectSelect;
