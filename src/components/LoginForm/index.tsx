import { CircleNotchIcon } from "@phosphor-icons/react";
import { Form, type FormProps, Select, Input, Button } from "antd";
import { performLogin } from "../../services/login";
import type { Login } from "../../types/Login";
import type { Env } from "../../types/Tenant";
import { useApp } from "../../context/appContext";
import { useState } from "react";
import { useNotification } from "../../context/notificationContext";
import "./styles.scss";

interface LoginFormProps {
  setOpenSidebar: (isLogged: boolean) => void;
}

function LoginForm({ setOpenSidebar }: LoginFormProps) {
  const [environment, setEnvironment] = useState<Env>("HOM");
  const [isLoading, setLoading] = useState(false);
  const { openNotification } = useNotification();
  const { setEnv, setToken } = useApp();

  const onFinish: FormProps<Login>["onFinish"] = async (values: Login) => {
    const res = await performLogin(values);

    if (res.success) {
      setEnv(values.env);
      setToken(res.data?.token ?? null);
      openNotification("success", { title: "Login realizado com sucesso!" });
      setLoading(false);
      setOpenSidebar(false);
    } else {
      openNotification("error", { title: "Erro!", description: res.message });
      setLoading(false);
    }
  };

  const onFinishFailed: FormProps<Login>["onFinishFailed"] = () => {
    openNotification("warning", {
      title: "Por favor, preencha todos os campos obrigatórios",
    });
    setLoading(false);
  };

  const options: { label: string; value: Env }[] = [
    { label: "HOM", value: "HOM" },
    { label: "PROD", value: "PROD" },
    { label: "DEV", value: "DEV" },
  ];

  return (
    <div className="login">
      <p>Login</p>
      <Form<Login>
        name="basic"
        layout="vertical"
        classNames={{ label: "login__labels" }}
        initialValues={{ env: "HOM" as Env }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item label="Ambiente" name="env" rules={[{ required: true }]}>
          <Select<Env>
            classNames={{
              root: "login__fields",
              content: "login__fields",
            }}
            value={environment}
            onChange={(e) => setEnvironment(e)}
            options={options}
          />
        </Form.Item>

        <Form.Item
          label="Usuário"
          name="username"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <Input className="login__fields" />
        </Form.Item>

        <Form.Item
          label="Senha"
          name="password"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <Input.Password className="login__fields" />
        </Form.Item>

        <Form.Item label={null}>
          {isLoading ? (
            <Button
              loading
              iconPlacement={"end"}
              type="primary"
              htmlType="submit"
            >
              Login
            </Button>
          ) : (
            <Button
              type="primary"
              htmlType="submit"
              onClick={() => setLoading(true)}
            >
              Login
            </Button>
          )}
        </Form.Item>
      </Form>
    </div>
  );
}

export default LoginForm;
