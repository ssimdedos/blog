import axios from "axios";

const API_BASE_URL = '/api/dashboard';

export async function fetchDashboardData () {
  const res = await axios.get(API_BASE_URL);
    return res.data;
}