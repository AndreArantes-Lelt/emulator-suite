import { WarningIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { Form, Select, Input, Button, Modal } from "antd";
import type { FormProps } from "antd";

function Home() {
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [environment, setEnvironment] = useState<string>("HOM");

  type FieldType = {
    environment: string;
    username?: string;
    password?: string;
  };

  const onFinish: FormProps<FieldType>["onFinish"] = (values) => {
    console.log("Success:", values);
    // TODO: call API here
  };

  const onFinishFailed: FormProps<FieldType>["onFinishFailed"] = (err) => {
    setError(true);
    setErrorMessage(err.message);
  };

  const handleCloseModal = () => {
    setError(false);
  };

  return (
    <section className="canva">
      <div className="sidebar">
        <h1>Login</h1>

        <Form
          name="basic"
          layout="vertical"
          classNames={{ label: "sidebar__labels" }}
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
                root: "sidebar__fields",
                content: "sidebar__fields",
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

          <Form.Item<FieldType>
            label="Usuário"
            name="username"
            rules={[{ required: true, message: "Required field" }]}
          >
            <Input className="sidebar__fields" />
          </Form.Item>

          <Form.Item<FieldType>
            label="Senha"
            name="password"
            rules={[{ required: true, message: "Required field" }]}
          >
            <Input.Password className="sidebar__fields" />
          </Form.Item>

          <Form.Item label={null}>
            <Button type="primary" htmlType="submit">
              Login
            </Button>
          </Form.Item>
        </Form>
      </div>
      <div className="content"></div>

      <Modal open={isError} onOk={handleCloseModal} onCancel={handleCloseModal}>
        <WarningIcon size={30} />
        <p>{errorMessage}</p>
      </Modal>
    </section>
  );
}

export default Home;
