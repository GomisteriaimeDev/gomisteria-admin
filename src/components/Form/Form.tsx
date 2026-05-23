import './Form.scss'
const FormWrapper = (props:any) => {
    return (
      <form onSubmit={ event => props?.onSubmit?.({event}) } className="formWrapper">
          <legend>{props?.title}</legend>
          {props?.children}
      </form>
      );
  };

  export default FormWrapper;