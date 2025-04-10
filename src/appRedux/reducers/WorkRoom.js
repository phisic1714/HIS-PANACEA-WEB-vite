import {
  SELECT_WORK_ROOM,
  OPDCLINIC_ROOM,
  DENTAL_ROOM,
  DOCTORCLINIC_ROOM,
  WARD_ROOM,
  LABORATORY_ROOM,
  OPDPRESCRIPTION_ROOM,
  IPDPRESCRIPTION_ROOM,
  Operation_ROOM,
  INVENTORY_ROOM,
  QUEUE_ROOM,
  PSYCHIATRIC_ROOM,
} from "../../constants/ActionTypes";

const INIT_STATE = {
  error: "",
  loading: false,
  selectWorkRoom: JSON.parse(window.localStorage.getItem('selectWorkRoom')),
  //menu 7
  opdClinicRoom: JSON.parse(window.localStorage.getItem('opdClinicRoom')),
  //menu 9
  dentalRoom: JSON.parse(window.localStorage.getItem('dentalRoom')),
  //menu 10
  doctorClinicRoom: JSON.parse(window.localStorage.getItem('doctorClinicRoom')),
  //menu 11
  wardRoom: JSON.parse(window.localStorage.getItem('wardRoom')),
  //menu 12
  laboratoryRoom: JSON.parse(window.localStorage.getItem('laboratoryRoom')),
  //menu 14
  opdPrescriptionRoom: JSON.parse(window.localStorage.getItem('opdPrescriptionRoom')),
  //menu 15
  ipdPrescriptionRoom: JSON.parse(window.localStorage.getItem('ipdPrescriptionRoom')),
  //menu 18
  operationRoom: JSON.parse(window.localStorage.getItem('operationRoom')),
  //menu 25
  inventoryRoom: JSON.parse(window.localStorage.getItem('inventoryRoom')),
  //menu 75
  queueRoom: JSON.parse(window.localStorage.getItem('queueRoom')),
  //menu 80
  psychiatricRoom: JSON.parse(window.localStorage.getItem('psychiatricRoom')),
};

const WorkRoom = (state = INIT_STATE, action) => {
  switch (action.type) {
    case SELECT_WORK_ROOM: {
      return {
        ...state,
        error: "",
        selectWorkRoom: action.payload,
        loading: false,
      };
    }
    case OPDCLINIC_ROOM: {
      //menu 7
      return {
        ...state,
        error: "",
        opdClinicRoom: action.payload,
        loading: false,
      };
    }
    case DENTAL_ROOM: {
      //menu 9
      return {
        ...state,
        error: "",
        dentalRoom: action.payload,
        loading: false,
      };
    }
    case DOCTORCLINIC_ROOM: {
      //menu 10
      return {
        ...state,
        error: "",
        doctorClinicRoom: action.payload,
        loading: false,
      };
    }
    case WARD_ROOM: {
      //menu 11
      return { ...state, error: "", wardRoom: action.payload, loading: false };
    }
    case LABORATORY_ROOM: {
      //menu 12
      return {
        ...state,
        error: "",
        laboratoryRoom: action.payload,
        loading: false,
      };
    }
    case OPDPRESCRIPTION_ROOM: {
      //menu 14
      return {
        ...state,
        error: "",
        opdPrescriptionRoom: action.payload,
        loading: false,
      };
    }
    case IPDPRESCRIPTION_ROOM: {
      //menu 15
      return {
        ...state,
        error: "",
        ipdPrescriptionRoom: action.payload,
        loading: false,
      };
    }
    case Operation_ROOM: {
      //menu 18
      return {
        ...state,
        error: "",
        operationRoom: action.payload,
        loading: false,
      };
    }
    case INVENTORY_ROOM: {
      //menu 25
      return {
        ...state,
        error: "",
        inventoryRoom: action.payload,
        loading: false,
      };
    }
    case QUEUE_ROOM: {
      //menu 75
      return {
        ...state,
        error: "",
        queueRoom: action.payload,
        loading: false,
      };
    }
    case PSYCHIATRIC_ROOM: {
      //menu 80
      return {
        ...state,
        error: "",
        psychiatricRoom: action.payload,
        loading: false,
      };
    }
    default:
      return state;
  }
};

export default WorkRoom;
