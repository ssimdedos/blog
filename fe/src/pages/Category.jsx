import { useEffect } from "react";
import Board from "../components/Board";
import { useParams } from "react-router-dom";

const Category = () => {
  const { id } = useParams();
  useEffect(()=> {
    // console.log(categoryType);
  }, []);
  return (
    <Board category={id} />
  )
};

export default Category;