import { ArrowLineLeftIcon, ArrowLineRightIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Tabs, type TabsProps, Button } from "antd";
import LoginForm from "../../components/LoginForm";
import ProjectSelect from "../../components/ProjectSelect";
import SensorTab from "../Tabs/Sensor";
import OTDRTab from "../Tabs/OTDR";

function Home() {
  const [isSidebarOpen, setOpenSidebar] = useState(true);
  const [selectedTab, setSelectedTab] = useState("SENSOR");

  const items: TabsProps["items"] = [
    {
      key: "SENSOR",
      label: "SENSOR",
      children: <SensorTab isSelectedTab={selectedTab === "SENSOR"} />,
    },
    {
      key: "OTDR",
      label: "OTDR",
      children: <OTDRTab isSelectedTab={selectedTab === "OTDR"} />,
    },
  ];

  return (
    <section className="canva">
      {isSidebarOpen ? (
        <div className="sidebar">
          <Button onClick={() => setOpenSidebar(false)}>
            <ArrowLineLeftIcon size={20} />
          </Button>

          <LoginForm setOpenSidebar={setOpenSidebar} />
        </div>
      ) : (
        <div className="sidebar--closed">
          <Button onClick={() => setOpenSidebar(true)}>
            <ArrowLineRightIcon size={20} />
          </Button>
        </div>
      )}

      <div className="main">
        <ProjectSelect />
        <Tabs
          type="card"
          size="medium"
          items={items}
          activeKey={selectedTab}
          onChange={(e) => setSelectedTab(e)}
        />
      </div>
    </section>
  );
}

export default Home;
