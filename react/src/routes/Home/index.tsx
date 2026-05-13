import { WarningIcon } from "@phosphor-icons/react";
import { useState } from "react";
import { Modal } from "antd";
import LoginForm from "../../components/LoginForm";

function Home() {
  const [isError, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCloseModal = () => {
    setError(false);
  };

  return (
    <section className="canva">
      <div className="sidebar">
        <LoginForm />
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
