import { Card, Modal, ListGroup, Button } from 'react-bootstrap';
import  UserDetailsPopup  from '../utility/UserDetailsPopup';
import { LoadingPage } from '../utility/LoadingPage';
import useLikeState from './useLikeState';


const LikesModal = ({ itemId, itemType, setShow, show }) => {

  const {stateInfo, funcs} = useLikeState({ itemId, itemType, setShow, show });

  const [likes] = stateInfo;

  const [handleClose] = funcs;

return (
  <>
    <Modal size="lg" show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title></Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <Card>
          <ListGroup variant="flush">
            {likes.dataList.length > 0 ? (
              likes.dataList.map((like, index) => {
                return (
                  <ListGroup.Item key={`like${like.id}`}>
                    <div className="col-md">
                      <UserDetailsPopup owner={like.owner} />
                    </div>
                  </ListGroup.Item>
                );
              })
            ) : (
              <LoadingPage noOfDivs={1} />
            )}
          </ListGroup>
        </Card>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  </>
);
};

export default LikesModal;