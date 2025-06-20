import { useEffect } from "react";
import { useParams } from "react-router-dom";
import BoardByTag from "../components/BoardByTag";

const PostsByTag = () => {
  const { tagId, tagName } = useParams();

  useEffect(() => {
  },[])
  

  return (
    <BoardByTag tagId={tagId} tagName={tagName} />
  )
};

export default PostsByTag;