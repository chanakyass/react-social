import { useAccordionToggle } from "react-bootstrap";

export function CustomToggle({ children, eventKey, onClick, attachRef }) {

    console.log(onClick);
    const decoratedOnClick = useAccordionToggle(eventKey, () =>
    {

        // onClick();
    }
);

  return (
    <button
      type="button"
          className='toggle-button'
          onClick={decoratedOnClick}
          ref = {attachRef}
    >
      {children}
    </button>
  );
}
