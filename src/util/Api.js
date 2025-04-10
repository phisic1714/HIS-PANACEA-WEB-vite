import { env } from '../env.jsx';
import axios from "axios";
export const httpClient = axios.create({
  baseURL: `${env.REACT_APP_URL_API}/jwtauth/api/`,
  //YOUR_API_URL HERE
  headers: {
    "Content-Type": "application/json"
  }
});
export const httpPanaceas = axios.create({
  baseURL: `${env.REACT_APP_PANACEACHS_SERVER}/api/`,
  //YOUR_API_URL HERE
  headers: {
    "Content-Type": "application/json"
  }
});
export const httpKiosk = axios.create({
  headers: {
    "Content-Type": "application/json",
    "Authorization": null
  }
})