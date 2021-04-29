import { useAccordionToggle } from "react-bootstrap";

function CustomToggle({ children, eventKey, attachRef, allowToggle }) {
    
    const decoratedOnClick =  useAccordionToggle(eventKey, () =>
    {

    }
);

  return (
    <div
      type="button"
      style = {
        {
        background: 'none',
        border:'none',
        padding:'0%'

        }
      }
      onClick={ e => allowToggle > 0 ? decoratedOnClick() : null}
      ref = {attachRef}
    >
      {children}
    </div>
  );
}

export default CustomToggle;
