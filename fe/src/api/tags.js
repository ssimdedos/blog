import axios from "axios";

const API_BASE_URL = '/api/tag';

export async function fetchTags () {
  const res = axios.get(API_BASE_URL);
  return (await res).data
};