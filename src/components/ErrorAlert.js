import { useState, useEffect } from 'react'
import { Alert } from 'react-bootstrap'
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWindowClose } from "@fortawesome/free-regular-svg-icons";
import history from '../app-history'

export const ErrorAlert = ({alertMessage}) => {
const [show, setShow] = useState(true);

    useEffect(() => {
        setTimeout(() => {
            setShow(false);

    }, 3000)
  })

  return (
    <>
      <Alert style={{  zIndex: '5000' }} show={show} variant="success" dismissible>

        <p>{alertMessage}</p>

      </Alert>
    </>
  );
}
