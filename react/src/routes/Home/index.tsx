import {
  GearIcon,
  ArrowLineLeftIcon,
  ArrowLineRightIcon,
} from "@phosphor-icons/react";
import { useState } from "react";
import { Tabs, type TabsProps, Button, Dropdown } from "antd";
import LoginForm from "../../components/LoginForm";
import SensorTab from "../Tabs/Sensor";
import ONUTab from "../Tabs/ONU";
import OTDRTab from "../Tabs/OTDR";

function Home() {
  const [isSidebarOpen, setOpenSidebar] = useState(true);

  const items: TabsProps["items"] = [
    {
      key: "SENSOR",
      label: "SENSOR",
      children: <SensorTab />,
    },
    {
      key: "ONU",
      label: "ONU",
      children: <ONUTab />,
    },
    {
      key: "OTDR",
      label: "OTDR",
      children: <OTDRTab />,
    },
  ];

  const handleOpenSidebar = (open: boolean) => {
    setOpenSidebar(open);
  };

  return (
    <section className="canva">
      {isSidebarOpen ? (
        <div className="sidebar">
          <Button onClick={() => handleOpenSidebar(false)}>
            <ArrowLineLeftIcon size={20} />
          </Button>

          <LoginForm setOpenSidebar={handleOpenSidebar} />
        </div>
      ) : (
        <div className="sidebar--closed">
          <Button onClick={() => handleOpenSidebar(true)}>
            <ArrowLineRightIcon size={20} />
          </Button>
        </div>
      )}

      <div className="main">
        <Tabs
          type="card"
          size="large"
          items={items}
          tabBarExtraContent={
            <Dropdown>
              <GearIcon size={20} />
            </Dropdown>
          }
          defaultActiveKey="SENSOR"
        />
      </div>
    </section>
  );
}

export default Home;
