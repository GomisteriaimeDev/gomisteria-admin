import "./DangerButton.scss";

function DangerButton(props: any) {
  const { className} = props;
  return (
    <button
      className={`dangerButtonComponent ${className}`}
      type={props.type}
      onClick={props?.onClick}
    >
      {props.children}
    </button>
  );
}

export default DangerButton;
