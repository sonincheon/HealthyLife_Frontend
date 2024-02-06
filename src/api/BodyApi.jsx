import Common from "../utils/Common";
import AxiosInstance from "./AxiosInstance";
import axios from "axios";
const BACKEND_DOMAIN = process.env.REACT_APP_BACKEND_DOMAIN;

const BodyApi = {
  LoadBody: async () => {
    const res = await Common.TakenToken();
    const email = res.data;
    return await axios.post(BACKEND_DOMAIN + "/Body/list/email", email);
  },

  InsertBody: async (
    bmi,
    bmr,
    date,
    fat,
    fatPercent,
    height,
    muscle,
    weight
  ) => {
    const res = await Common.TakenToken();
    const email = res.data;
    const userBody = {
      bmi: bmi,
      bmr: bmr,
      date: date,
      fat: fat,
      fatPercent: fatPercent,
      height: height,
      memberEmail: email,
      muscle: muscle,
      weight: weight,
    };
    return await axios.post(BACKEND_DOMAIN + "/Body/new", userBody);
  },
};
export default BodyApi;