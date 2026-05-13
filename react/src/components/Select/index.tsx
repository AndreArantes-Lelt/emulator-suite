import { Select as AntSelect } from "antd";
import { type Project } from "../../types/Project";
import "./styles.scss";

interface SelectProps {
  projects: Project[];
}

function Select({ projects }: SelectProps) {
  const projectOptions = projects.map((project) => ({
    value: project.id,
    label: project.name,
  }));

  return (
    <AntSelect
      classNames={{
        root: "content__fields",
        content: "content__fields",
      }}
      options={projectOptions}
    />
  );
}

export default Select;
