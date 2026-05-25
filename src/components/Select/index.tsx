import { CaretDownIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { Select as AntSelect, type SelectProps } from "antd";
import "./styles.scss";

function Select<T>(props: SelectProps) {
  return (
    <AntSelect<T>
      {...props}
      classNames={
        props.classNames
          ? props.classNames
          : {
              root: "select__field",
              content: "select__field",
            }
      }
      suffixIcon={
        <>
          {props.loading ? (
            <CircleNotchIcon
              className="loading-animation"
              size={20}
              style={{ color: "var(--white)" }}
            />
          ) : (
            <CaretDownIcon size={20} style={{ color: "var(--white)" }} />
          )}
        </>
      }
      showSearch={false}
    />
  );
}

export default Select;
