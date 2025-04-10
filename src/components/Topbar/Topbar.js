/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect } from 'react'
import TopbarCoponent from 'containers/Topbar';
import { useSelector } from 'react-redux';
export default function Topbar({
    PatientSearch = false,
    AdmitSearch = false,
    SearchOpd = false,
    BtnScan = false,
    PatientType = false,
    NeoHosp = false,
    allSearch = true,
    allSearchType = "Hn",
    lastSelect = true,
    opdipd = null,
    hiddenAn = false,
    getPatientDetail = true,
    returnPatientDetail = () => { },
}) {
    const allSearchPatientDetail = useSelector(({ Search }) => Search)
    useEffect(() => {
        returnPatientDetail(allSearchPatientDetail)
    }, [allSearchPatientDetail])

    return <TopbarCoponent
        PatientSearch={PatientSearch}
        AdmitSearch={AdmitSearch}
        SearchOpd={SearchOpd}
        BtnScan={BtnScan}
        PatientType={PatientType}
        NeoHosp={NeoHosp}
        // AKA
        allSearch={allSearch}
        allSearchType={allSearchType}
        lastSelect={lastSelect}
        opdipd={opdipd}
        hiddenAn={hiddenAn}
        getPatientDetail={getPatientDetail}
    />
}
