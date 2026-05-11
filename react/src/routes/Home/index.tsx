import { WarningIcon } from "@phosphor-icons/react";
import { useState, useEffect } from "react";
import { Form, Select, Input, Button, Modal } from "antd";
import type { FormProps } from "antd";

function Home() {
  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCloseModal = () => {
    setError(false);
  };

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

  const onEnvironmentChange = (value: string) => {
    switch (value) {
      case "HOM":
        // TODO: set to environment
        break;
      case "PROD":
        // TODO: set to environment
        break;
      case "DEV":
        // TODO: set to environment
        break;
      default:
    }
  };

  return (
    <section className="canva">
      <div className="sidebar">
        <h1>Login</h1>
        <Form
          name="basic"
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
          style={{ maxWidth: 600 }}
          initialValues={{ remember: true }}
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
              allowClear
              placeholder="Select a option and change input text above"
              onChange={onEnvironmentChange}
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
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            label="Senha"
            name="password"
            rules={[{ required: true, message: "Required field" }]}
          >
            <Input.Password />
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
        <p>{errorMessage}</p>
      </Modal>
    </section>
  );
}

export default Home;
