import { toNumber } from "lodash";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { withResolve } from "api/create-api";

export function useAgeForRsp() {
    const { selectPatient } = useSelector(({ patient }) => patient);

    const [ageLengthForRsp, setAgeLengthForRsp] = useState(null);

    const getAgeByPatientId = async (patientId) => {
        setAgeLengthForRsp(null);
        const { error, result } = await withResolve(`/api/CancerRegistration/GetAgeByPatientId/${patientId}`).fetch()
        if (error) return

        let y = toNumber(result?.year || 0);
        let m = toNumber(result?.month || 0);
        if (y) {
            if (y >= 9) return setAgeLengthForRsp('>9y');
            if (y >= 6) return setAgeLengthForRsp('6-8y');
            if (y >= 1) return setAgeLengthForRsp('1-5y');
        }
        if (m >= 2) return setAgeLengthForRsp('2m-1y');
        return setAgeLengthForRsp('2m');
    };

    useEffect(() => {
        if (selectPatient?.patientId) getAgeByPatientId(selectPatient?.patientId);
    }, [selectPatient]);


    return {
        ageLengthForRsp
    }
};
