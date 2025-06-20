import { useEffect } from "react";
import Board from "../components/Board";
import { useParams } from "react-router-dom";

const Category = () => {
  const { id } = useParams();
  const { sub_id } = useParams();

  return (
    <Board category={id} subcategory={sub_id} />
  )
};

export default Category;