import React, { useEffect, useState } from 'react'

import cookie from 'react-cookies'
import history from '../../app-history'
import { loadUserFeed } from '../post/post-service'
import cleanEmpty from '../utility/cleanup-objects'
import {
  Card,
  OverlayTrigger,
  Popover
} from "react-bootstrap";
import { Post } from '../post/Post'
import  {Link}  from 'react-router-dom'
import { RestMethod } from '../../enums'


const UserFeed = React.memo(() => {



  const [pagePosts, setPosts] = useState({ currentPageNo: 0, noOfPages: 0, dataList: [] })

  useEffect(() => {
     (async () => {
       const body = await loadUserFeed();
       if ('error' in body)
       {
         console.log(body.error)
         history.push('/error')
       }
       else
         setPosts(body);
       
         
    })()
  }, [])

  const jwtToken = cookie.load('jwt')
  const currentUser = cookie.load('current_user')

    return (
      <div className="col-md-8 my-3 mx-auto">

  

        {pagePosts.dataList && pagePosts.dataList.length > 0 ? (
          pagePosts.dataList.map((post, index) => {

            return (
              
              <Post key={`post${post.id}`} post={post} setPosts={setPosts} />
              
            );
          })
        ) : (
          <>loading</>
        )}
      </div>
    );
    
}
)

export default UserFeed