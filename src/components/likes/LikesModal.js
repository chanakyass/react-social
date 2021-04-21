import { Card, Modal, ListGroup, Button } from 'react-bootstrap';
import { UserDetailsPopup } from '../UserDetailsPopup';
import { useEffect, useState, useCallback } from 'react';
import { loadLikesOnPost, loadLikesOnComment } from "./like-service";
import { handleError } from '../error/error-handling';


export const LikesModal = ({ itemId, itemType, setShow, show }) => {

  const [likes, setLikes] = useState({ dataList: [], currentPageNo: 0, noOfPages: 0 })
    
  const handleClose = () => setShow(false);
  
  const loadOnRender = useCallback(async () => {
    if (show === true) {
          
      try {
        let body = null;
        if (itemType === "POST") body = await loadLikesOnPost(itemId, 0);
        else body = await loadLikesOnComment(itemId, 0);
        if ("error" in body) {
          const { error } = body;
          throw error;
        } else {
          setLikes(body);
        }
      } catch (error) {
        handleError({ error });
      }
          
    }
  }, [itemId, itemType, show]);

    useEffect(() => {
      (async () => {
        await loadOnRender();
      })();

}, [loadOnRender])

return (
    <>
      <Modal
        size="lg"
        show={show}
        onHide={handleClose}
        centered
        >
    
        <Modal.Header closeButton>
          <Modal.Title></Modal.Title>
        </Modal.Header>
        <Modal.Body className='p-0'>
        <Card >
        <ListGroup variant="flush">
        { likes.dataList.map((like, index)=>{
          return <ListGroup.Item key={`like${like.id}`}>
              <div className="col-md">
                <UserDetailsPopup owner={like.owner} />
            </div>
            </ListGroup.Item>;
        }) 
        }
            
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