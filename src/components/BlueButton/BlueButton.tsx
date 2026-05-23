import "./BlueButton.scss";

function BlueButton(props: any) {
  const { className} = props;
  return (
    <button
      className={`blueButtonComponent ${className}`}
      type={props.type}
      onClick={props?.onClick}
    >
      {props.children}
    </button>
  );
}

export default BlueButton;
