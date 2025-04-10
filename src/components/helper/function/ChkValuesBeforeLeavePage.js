import React, { useEffect, useCallback, useState } from 'react'
import { useHistory, useLocation } from "react-router-dom";
export default function ChkValuesBeforeLeavePage({
    form,
    isEdit,
    allowNavigation,
}) {
    const history = useHistory();
    const location = useLocation();
    // console.log('location :>> ', location);
    const handleGoToIntendedPage = useCallback(location => history.push(location), [history]);
    const [tempPathname, setTempPathname] = useState("")
    // console.log('tempPathname :>> ', tempPathname);
    useEffect(() => {
        if (allowNavigation === "allowed") return handleGoToIntendedPage(tempPathname)
        const unblock = history.block((location) => {
            if (isEdit) {
                setTempPathname(location.pathname)
                form.setFieldsValue({ allowNavigation: "wait" })
                form.submit()
                return false; // Allow navigation only if the user confirms
            }
            return true; // Allow navigation if no condition
        });

        return () => {
            unblock(); // Cleanup the block when the component unmounts
        };
    }, [history, isEdit, allowNavigation, tempPathname])
    return <></>
}
