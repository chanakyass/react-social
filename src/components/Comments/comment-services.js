const handleGetComments = (e, postId, commentId, pageNo) => {
  const postProp = `post${postId}`.trim();
  const commentProp = `comment${commentId}`.trim();
  if (
    (commentId &&
      (!commentsRef.current[commentProp] ||
        (commentsRef.current[commentProp] &&
          commentsRef.current[commentProp].currentPageNo !== pageNo))) ||
    (postId &&
      (!commentsRef.current[postProp] ||
        (commentsRef.current[postProp] &&
          commentsRef.current[postProp].currentPageNo !== pageNo)))
  ) {
    const requestOptions = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        "Content-Type": "application/json",
      },
    };

    fetch(
      `http://localhost:8080/api/v1/resource/post/${postId}/comments/${pageNo}`,
      requestOptions
    )
      .then((response) =>
        response.json().then((body) => {
          if (response.status === 200) {
            if (commentId == null) {
              setComments({ ...comments, [postProp]: body });
            } else {
              setComments({ ...comments, [commentProp]: body });
            }
          } else {
            const { error } = body;
            console.log(error);
            history.push("/error");
          }
        })
      )
      .catch((error) => {
        console.log(error);
        history.push("/error");
      });
  }
};
