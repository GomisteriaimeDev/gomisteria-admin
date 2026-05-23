
import './OutlineButton.scss'

function OutlineButton(props:any) {

  return (
    <button className="outlineButtonComponent" type={props.type} onClick={props?.onClick} >
      {props.children}
    </button>
  );
}

export default OutlineButton;