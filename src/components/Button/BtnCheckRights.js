import React, { useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from 'antd'
import { callApis } from 'components/helper/function/CallApi';
import { toast } from "react-toastify";
import { smartCardAction } from "appRedux/actions/SmartCardAction";
import NHSORight from "components/helper/NHSORight";

export default function BtnCheckRights({
    size = "small",
    idCard = null,
    patient = null,
    reloadPatientRight = () => { }
}) {
    const NHSORightRef = useRef(null);
    const dispatch = useDispatch();
    const smartCard = useSelector(({ smartCard }) => smartCard);
    // State
    const [requestDataRight, setRequestDataRight] = useState(null);
    const [visibleSelactRight, setVisibleSelactRight] = useState(false);
    // Funcs
    const handleClickCheckRights = () => {
        const ws = new WebSocket("ws://localhost:8100");
        ws.onopen = function (e) {
            if (smartCard?.IsHasCard) {
                ws.send(JSON.stringify({
                    Type: "UC",
                    Url: ""
                }));
            } else {
                ws.send(JSON.stringify({
                    Type: "TOKEN",
                    Url: ""
                }));
            }
        };
        ws.onmessage = function (e) {
            var jsonResult = "";
            if (e?.data && e?.data !== "Connected Port : 127.0.0.1:8100" && e?.data !== "Find not found function") {
                jsonResult = JSON.parse(e?.data);
                if (jsonResult?.PatientIdCard == null) {
                    jsonResult.PatientIdCard = idCard;
                }
                if (jsonResult?.PatientIdCard == null) {
                    toast.error("เลขบัตรประชาชนคนไข้ไม่ถูกต้อง", {
                        position: "top-right",
                        autoClose: 3000,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                        theme: "light"
                    });
                    return;
                }
                setRequestDataRight(jsonResult);
                dispatch(smartCardAction({
                    ...smartCard?.Personal,
                    insid: jsonResult?.person_id
                }));
                if (jsonResult?.PatientIdCard && jsonResult?.Citizenid && jsonResult?.Token) {
                    NHSORightRef.current.setShowCheckVisitModal(true);
                    callApis(apis["UpdChkRight"], patient?.patientId)
                }
                ws.close();
            }
        };
    }
    return <>
        <Button
            size={size}
            type="primary"
            className="mb-0"
            onClick={(e) => {
                e.stopPropagation();
                handleClickCheckRights()
            }}
        >ตรวจสอบสิทธิ์</Button>
        <NHSORight
            ref={NHSORightRef}
            patient={patient}
            requestRight={requestDataRight}
            NHSORightRef={NHSORightRef}
            setVisibleSelactRight={setVisibleSelactRight}
            visibleSelactRight={visibleSelactRight}
            setReloadVisitTable={() => reloadPatientRight()}
            onInsPatientRight={() => reloadPatientRight()}
        />
    </>
}

const apis = {
    UpdChkRight: {
        url: "RightCheck/UpdChkRight/",
        method: "GET",
        return: "responseData",
        sendRequest: false,
    },
}