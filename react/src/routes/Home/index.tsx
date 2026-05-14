import { GearIcon, WarningIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Tabs, type TabsProps, Button, Modal } from "antd";
import LoginForm from "../../components/LoginForm";
import SensorTab from "../Tabs/Sensor";
import ONUTab from "../Tabs/ONU";
import OTDRTab from "../Tabs/OTDR";

function Home() {
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const actions = (
    <Button>
      <GearIcon size={20} />
    </Button>
  );

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "SENSOR",
      children: <SensorTab />,
    },
    {
      key: "2",
      label: "ONU",
      children: <ONUTab />,
    },
    {
      key: "3",
      label: "OTDR",
      children: <OTDRTab />,
    },
  ];

  const handleCloseModal = () => {
    setError(false);
  };

  return (
    <section className="canva">
      <div className="sidebar">
        <LoginForm />
      </div>

      <div className="main">
        <Tabs
          type="card"
          size="large"
          tabBarExtraContent={actions}
          defaultActiveKey="1"
          items={items}
        />
      </div>

      <Modal open={isError} onOk={handleCloseModal} onCancel={handleCloseModal}>
        <WarningIcon size={30} />
        <p>{errorMessage}</p>
      </Modal>
    </section>
  );
}

export default Home;
