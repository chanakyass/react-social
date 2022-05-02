import { useEffect, useState, useCallback } from 'react';
import { likeService } from "./like-service";
import { handleError } from '../error/error-handling';


const useLikeState = ({ itemId, itemType, setShow, show }) => {

  const [likes, setLikes] = useState({ dataList: [], currentPageNo: 0, noOfPages: 0 })
    
  const handleClose = () => setShow(false);
  
  const loadOnRender = useCallback( () => {
    if (show === true) {
      let promise;
        if (itemType === "POST") promise =  likeService.loadLikesOnPost(itemId, 0);
      else promise = likeService.loadLikesOnComment(itemId, 0);
      
      promise.then(({ ok, responseBody: body, error }) => {
        if (!ok) {
          handleError({ error });
        } else {
          setLikes(body);
        }
      });
  
    }
  }, [itemId, itemType, show]);

    useEffect(() => {
      loadOnRender();
    }, [loadOnRender]);

    return {
        stateInfo: [likes],
        funcs: [handleClose]
    }
}

export default useLikeState;