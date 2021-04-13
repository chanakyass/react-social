import { useAccordionToggle } from "react-bootstrap";

export function CustomToggle({ children, eventKey, attachRef, allowToggle }) {

    
    const decoratedOnClick = useAccordionToggle(eventKey, () =>
    {

        // onClick();
    }
);

  return (
    <button
      type="button"
      style = {
        {
        background: 'none',
        border:'none',
        padding:'0%'

        }
      }
      onClick={ allowToggle > 0 ? decoratedOnClick : null}
      ref = {attachRef}
    >
      {children}
    </button>
  );
}
