import{
    WARD_MENU,
} from "../../constants/ActionTypes";


//module 11 dashbord
export const workRoomWard = (data) => {
    window.localStorage.setItem('workRoomWard',JSON.stringify(data));
    return {
        type: WARD_MENU,
        payload: data,
    };
};