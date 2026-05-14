import { Form, type FormProps, Select, Input, Button } from "antd";
import { type Login } from "../../types/Login";
import { useState } from "react";
import useNotification from "../../hooks/useNotification";
import "./styles.scss";

function LoginForm() {
  const [environment, setEnvironment] = useState<string | null>("HOM");
  const { openNotification, contextHolder } = useNotification();

  const onFinish: FormProps<Login>["onFinish"] = (values) => {
    console.log("Success:", values);
    // TODO: call API here
  };

  const onFinishFailed: FormProps<Login>["onFinishFailed"] = () => {
    openNotification("warning", {
      title: "Por favor, preencha todos os campos obrigatórios",
    });
  };

  return (
    <>
      {contextHolder}
      <h1>Login</h1>
      <Form
        name="basic"
        layout="vertical"
        classNames={{ label: "login__labels" }}
        initialValues={{ environment: "HOM" }}
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Ambiente"
          name="environment"
          rules={[{ required: true }]}
        >
          <Select
            classNames={{
              root: "login__fields",
              content: "login__fields",
            }}
            value={environment}
            onChange={(e) => setEnvironment(e)}
            options={[
              { label: "HOM", value: "HOM" },
              { label: "PROD", value: "PROD" },
              { label: "DEV", value: "DEV" },
            ]}
          />
        </Form.Item>

        <Form.Item<Login>
          label="Usuário"
          name="username"
          rules={[{ required: true, message: "Campo obrigatório" }]}
        >
          <Input className="login__fields" />
        </Form.Item>

        <Form.Item<Login>
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
    </>
  );
}

export default LoginForm;
