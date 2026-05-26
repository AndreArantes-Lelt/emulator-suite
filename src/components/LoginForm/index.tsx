import { Form, type FormProps, Input, Button } from "antd";
import Select from "../Select";
import { type LoginParams, performLogin } from "../../services/login";
import type { Env } from "../../types/Tenant";
import type { Options } from "../../types/Utils";
import { useApp } from "../../context/appContext";
import { useState } from "react";
import { useNotification } from "../../context/notificationContext";
import "./styles.scss";

interface LoginFormProps {
  setOpenSidebar: (isLogged: boolean) => void;
}

const options: Options<Env>[] = [
  { label: "HOM", value: "HOM" },
  { label: "PROD", value: "PROD" },
  { label: "DEV", value: "DEV" },
];

function LoginForm({ setOpenSidebar }: LoginFormProps) {
  const [isLoading, setLoading] = useState(false);
  const { openNotification } = useNotification();
  const { setEnv, setToken } = useApp();

  const onFinish: FormProps<LoginParams>["onFinish"] = async (
    values: LoginParams,
  ) => {
    const res = await performLogin(values);

    if (res.success) {
      setEnv(values.env);
      setToken(res.data?.token ?? null);
      openNotification("success", { title: "Login realizado com sucesso!" });
      setOpenSidebar(false);
    } else {
      openNotification("error", { title: "Erro!", description: res.message });
    }

    setLoading(false);
  };

  const onFinishFailed: FormProps<LoginParams>["onFinishFailed"] = () => {
    openNotification("warning", {
      title: "Por favor, preencha todos os campos obrigatórios",
    });
    setLoading(false);
  };

  return (
    <div className="login">
      <p>Login</p>
      <Form<LoginParams>
        name="basic"
        layout="vertical"
        classNames={{ label: "login__labels" }}
        initialValues={{ env: "HOM" as Env }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="on"
      >
        <Form.Item label="Ambiente" name="env" rules={[{ required: true }]}>
          <Select<Env>
            classNames={{
              root: "login__fields",
              content: "login__fields",
            }}
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
          <Button
            loading={isLoading}
            iconPlacement={"end"}
            type="primary"
            htmlType="submit"
            onClick={() => setLoading(true)}
          >
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default LoginForm;
