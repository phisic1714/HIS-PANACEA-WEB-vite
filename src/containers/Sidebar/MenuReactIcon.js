import React from 'react'
import { IoMegaphoneOutline, IoBarChartOutline } from 'react-icons/io5';
import { AiOutlineFileExcel } from 'react-icons/ai';
import { HiOutlineClipboardList } from 'react-icons/hi';
import { Icon } from '@iconify/react';
import iInpatient from '@iconify/icons-medical-icon/i-inpatient';
import iOutpatient from '@iconify/icons-medical-icon/i-outpatient';
import ambulanceIcon from '@iconify/icons-uil/ambulance';
import dentist16Regular from '@iconify/icons-fluent/dentist-16-regular';
import peopleQueue24Regular from '@iconify/icons-fluent/people-queue-24-regular';
import doctorIcon from '@iconify/icons-maki/doctor';
import hospitalIcon from '@iconify/icons-cil/hospital';
import gaugeIcon from '@iconify/icons-cil/gauge';
import iLaboratory from '@iconify/icons-medical-icon/i-laboratory';
import xrayOutline from '@iconify/icons-healthicons/xray-outline';
import medicinesOutline from '@iconify/icons-healthicons/medicines-outline';
import medicinesIcon from '@iconify/icons-healthicons/medicines';
import prescriptionDocumentOutline from '@iconify/icons-healthicons/prescription-document-outline';
import medicationAlert from '@iconify/icons-carbon/medication-alert';
import surgicalSterilization from '@iconify/icons-healthicons/surgical-sterilization';
import nutritionOutline from '@iconify/icons-healthicons/nutrition-outline';
import billsOutline from '@iconify/icons-healthicons/bills-outline';
import billsIcon from '@iconify/icons-healthicons/bills';
import handsHelping from '@iconify/icons-la/hands-helping';
import administratorLine from '@iconify/icons-clarity/administrator-line';
import buildingWarehouse from '@iconify/icons-tabler/building-warehouse';
import starIcon from '@iconify/icons-tabler/star';
import woldCareOutline from '@iconify/icons-healthicons/wold-care-outline';
import fileGroupLine from '@iconify/icons-clarity/file-group-line';
import iPathology from '@iconify/icons-medical-icon/i-pathology';
import ribbonIcon from '@iconify/icons-fa-solid/ribbon';
import cloudLogging from '@iconify/icons-carbon/cloud-logging';
import interfaceAlertRadioActive1DangerNukeRadiationNuclearWarningAlertRadioactiveCaution from '@iconify/icons-streamline/interface-alert-radio-active-1-danger-nuke-radiation-nuclear-warning-alert-radioactive-caution';
import iPhysicalTherapy from '@iconify/icons-medical-icon/i-physical-therapy';
import bandagedOutline from '@iconify/icons-healthicons/bandaged-outline';
import virusLabResearchSyringeOutline from '@iconify/icons-healthicons/virus-lab-research-syringe-outline';
import dollarOutline from '@iconify/icons-healthicons/dollar-outline';
import doctorMaleOutline from '@iconify/icons-healthicons/doctor-male-outline';
import outlineBloodtype from '@iconify/icons-ic/outline-bloodtype';
import { RiShieldUserLine, RiCalendarCheckLine, RiHandCoinLine } from 'react-icons/ri';
import psychotherapyLine from '@iconify/icons-ri/psychotherapy-line';
import hospitalBed from '@iconify/icons-icon-park-outline/hospital-bed';
import intravenousBag from '@iconify/icons-healthicons/intravenous-bag-outline';
import homePlus from '@iconify/icons-tabler/home-plus';
import { filter } from 'lodash';
const MenuReactIcon = (props) => {
    const icon = ["Information", "Registration", "Privilege Center", "Admission Center", "Refer Center", "Coder", "OPD Clinic", "Appointment", "Dental", "Doctor Clinic",
        "Ward", "Laboratory", "Diagnostic Radiography", "OPD Prescription", "IPD Presciption", "Drug Registration", "ADR Registration", "Operation Room", "Nutrition", "Outpatient Finance",
        "Inpatient Finance", "Reimbursement", "Social Welfare", "IT Admin", "Medication Supplies Inventory", "Nuclear Medication", "Physical Therapy", "Chemotherapy", "Cancer Registration", "Emergency Register",
        "Infection Control", "Central Supplies", "Blood Bank", "Health Checkup", "Risk Management", "Social Medication", "Pathology", "VIP Service", "Bed Management", "Document Management", "Log", "Queue", "Home HealthCare", "Psychiatric"]
    const matchVal = filter(icon, (data) => { return data === props.name })
    return (
        <div>
            {matchVal.length > 0 ? null : <AiOutlineFileExcel size={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Information" && <IoMegaphoneOutline size={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Registration" && <HiOutlineClipboardList size={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Privilege Center" && <RiShieldUserLine size={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Admission Center" && <Icon icon={iInpatient} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Refer Center" && <Icon icon={ambulanceIcon} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Coder" && <IoBarChartOutline size={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "OPD Clinic" && <Icon icon={iOutpatient} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Appointment" && <RiCalendarCheckLine size={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Dental" && <Icon icon={dentist16Regular} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Doctor Clinic" && <Icon icon={doctorIcon} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Ward" && <Icon icon={hospitalIcon} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Laboratory" && <Icon icon={iLaboratory} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Diagnostic Radiography" && <Icon icon={xrayOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "OPD Prescription" && <Icon icon={medicinesOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "IPD Presciption" && <Icon icon={medicinesIcon} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Drug Registration" && <Icon icon={prescriptionDocumentOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "ADR Registration" && <Icon icon={medicationAlert} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Operation Room" && <Icon icon={surgicalSterilization} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Nutrition" && <Icon icon={nutritionOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Outpatient Finance" && <Icon icon={billsOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Inpatient Finance" && <Icon icon={billsIcon} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Reimbursement" && <RiHandCoinLine size={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Social Welfare" && <Icon icon={handsHelping} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "IT Admin" && <Icon icon={administratorLine} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Medication Supplies Inventory" && <Icon icon={buildingWarehouse} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Nuclear Medication" && <Icon icon={interfaceAlertRadioActive1DangerNukeRadiationNuclearWarningAlertRadioactiveCaution} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Physical Therapy" && <Icon icon={iPhysicalTherapy} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Chemotherapy" && <Icon icon={intravenousBag} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Cancer Registration" && <Icon icon={ribbonIcon} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Emergency Register" && <Icon icon={bandagedOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Infection Control" && <Icon icon={virusLabResearchSyringeOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Central Supplies" && <Icon icon={dollarOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Blood Bank" && <Icon icon={outlineBloodtype} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Health Checkup" && <Icon icon={doctorMaleOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Risk Management" && <Icon icon={gaugeIcon} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Social Medication" && <Icon icon={woldCareOutline} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Pathology" && <Icon icon={iPathology} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "VIP Service" && <Icon icon={starIcon} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Bed Management" && <Icon icon={hospitalBed} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Document Management" && <Icon icon={fileGroupLine} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Queue" && <Icon icon={peopleQueue24Regular} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Psychiatric" && <Icon icon={psychotherapyLine} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Home HealthCare" && <Icon icon={homePlus} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
            {props.name === "Log" && <Icon icon={cloudLogging} width={props.size ? props.size : 25} color={props.color ? props.color : "000000"} />}
        </div>
    )
}

export default MenuReactIcon
