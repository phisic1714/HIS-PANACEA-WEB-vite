import { combineReducers } from 'redux'
import { connectRouter } from 'connected-react-router'
import Settings from "./Settings";
import Common from "./Common";
import AdmitDischarge from "./AdmitDischarge";
import Autocomplete from './Autocomplete'
import Patient from "./Patient";
import OpdPatientDetail from "./OpdPatientDetail"
import DataTypeAndPatient from "./DataTypeAndPatient"
import PatientType from "./patientType"
import WorkRoom from "./WorkRoom"
import WorkRoomWard from './WorkRoomWard';
import Drug from './Drug'
import SmartCard from './SmartCardReducer';
import Notification from './Notification'
import PatientScanner from './PatientScanner';
import moduleId from './moduleIdReducer'
import XRayWorkId from './XRayWorkId'
import OpdFinancePlace from './OpdFinancePlace'
import IpdFinancePlace from './IpdFinancePlace'
import Search from "./Search"
import GenFromDataTable from "./GenFromDataTable"
import GetDropdownMaster from "./DropdownMaster"
import HealthCheckup from "./HealthCheckup"
import Sound from "./Sound"
import BedManagement from './BedManagement';
import RiskManagement from './RiskManagement'
import TempData from './TempData'
import GetDropdowns from './Dropdowns'

const createRootReducer = (history) => combineReducers({
  router: connectRouter(history),
  settings: Settings,
  common: Common,
  admitDischarge: AdmitDischarge,
  autoComplete: Autocomplete,
  patient: Patient,
  opdPatientDetail: OpdPatientDetail,
  dataTypeAndPatient: DataTypeAndPatient,
  patientType: PatientType,
  workRoom: WorkRoom,
  workRoomWard: WorkRoomWard,
  drug: Drug,
  smartCard: SmartCard,
  moduleId: moduleId,
  notification: Notification,
  patientScanner: PatientScanner,
  xRayWorkId: XRayWorkId,
  opdFinancePlace: OpdFinancePlace,
  ipdFinancePlace: IpdFinancePlace,
  riskManagement: RiskManagement,
  Search: Search,
  GenFromDataTable: GenFromDataTable,
  getDropdownMaster: GetDropdownMaster,
  healthCheckup: HealthCheckup,
  Sound: Sound,
  bedManagement: BedManagement,
  tempData: TempData,
  getDropdowns: GetDropdowns,
});

export default createRootReducer;
