import React, { useState, useEffect } from 'react'
import { Alert } from 'react-bootstrap'

export const ErrorAlert = React.memo(({ alertMessage }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setShow(false);

    }, 3000)
  })

  return (
    <>
      <Alert style={{ zIndex: '5000', position: 'fixed', bottom: '1vh', left: '2vh'}} show={show} variant="secondary" dismissible>

        <p>{alertMessage}</p>

      </Alert>
    </>
  );
});
