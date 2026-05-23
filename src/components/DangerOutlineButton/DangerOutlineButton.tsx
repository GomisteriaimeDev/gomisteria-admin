import "./DangerOutlineButton.scss";

function DangerOutlineButton(props: any) {
  return (
    <button
      className="dangerOutlineButtonComponent"
      type={props.type}
      onClick={props?.onClick}
    >
      {props.children}
    </button>
  );
}

export default DangerOutlineButton;
