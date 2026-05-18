import { Form, type FormProps, Select, Input, Button } from "antd";
import { type Login } from "../../types/Login";
import { performLogin } from "../../services/login";
import type { Env } from "../../types/Url";
import { useAuth } from "../../context/authContext";
import { useState } from "react";
import { useNotification } from "../../context/notificationContext";
import "./styles.scss";

interface LoginFormProps {
  setOpenSidebar: (isLogged: boolean) => void;
}

function LoginForm({ setOpenSidebar }: LoginFormProps) {
  const [environment, setEnvironment] = useState<Env>("HOM");
  const { openNotification } = useNotification();
  const { setToken } = useAuth();

  const onFinish: FormProps<Login>["onFinish"] = async (values) => {
    const res = await performLogin(values as Login);

    if (res.success) {
      setToken(res.data?.token ?? null);
      openNotification("success", { title: "Login realizado com sucesso!" });
      setOpenSidebar(false);
    } else {
      openNotification("error", { title: "Erro!", description: res.message });
    }
  };

  const onFinishFailed: FormProps<Login>["onFinishFailed"] = () => {
    openNotification("warning", {
      title: "Por favor, preencha todos os campos obrigatórios",
    });
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
          <Button type="primary" htmlType="submit">
            Login
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default LoginForm;
