import Grid from "@mui/material/Unstable_Grid2";
import { useEffect, useMemo, useState } from 'react';
import CardNoRows from './card-no-row';
import { PropertyList } from './property-list';
import { PropertyListItem } from './property-list-item';
import { SystemAccordion } from './system-accordion';

const initialState = {
    his: [],
    backOffice: [],
    sap: [],
    ipd: [],
    emr: [],
    doc: [],
    kiosk: [],
    queue: [],
};

const formatModuleName = (name, nameEn) => {
    const formattedNameEn = nameEn ? `(${nameEn})` : "";

    return `${name} ${formattedNameEn}`;
};

let showColumnTwo = false;
let showColumnThree = false;

const MenuCardContent = ({ systems, modules, userMenus = [], checkHideDisabled = false }) => {
    const [state, setState] = useState(initialState);

    const hisSystem = systems.find((s) => s.id === 1);
    const backOfficeSystem = systems.find((s) => s.id === 3);
    const sapSystem = systems.find((s) => s.id === 4);
    const ipdSystem = systems.find((s) => s.id === 5);
    const emrSystem = systems.find((s) => s.id === 6);
    const docManagementSystem = systems.find((s) => s.id === 7);
    const kioskSystem = systems.find((s) => s.id === 8);
    const queueSystem = systems.find((s) => s.id === 9);

    useEffect(() => {
        const getModulesBySystem = (modules, systemId) => {
            let filterAndSort = modules
                .filter((module) => module.fkSystemId === systemId && module.active)
                .sort((a, b) => parseInt(a.code, 10) - parseInt(b.code, 10));

            filterAndSort = filterAndSort.map((v) => {
                let href = ''
                const findMenu = userMenus.find(
                    (m) => m.seq === v.code
                );

                if (findMenu && findMenu?.children?.length > 0) href = `/${findMenu.eName?.toLowerCase()}/${findMenu?.children[0].code?.toLowerCase()?.replaceAll('_', '-')}`

                return {
                    ...v,
                    href: href,
                    disabled: !findMenu
                }
            })

            return checkHideDisabled ? filterAndSort.filter((v) => !v.disabled) : filterAndSort
        }

        if (modules.length) {
            const newState = {
                his: getModulesBySystem(modules, 1),
                backOffice: getModulesBySystem(modules, 3),
                sap: getModulesBySystem(modules, 4),
                ipd: getModulesBySystem(modules, 5),
                emr: getModulesBySystem(modules, 6),
                doc: getModulesBySystem(modules, 7),
                kiosk: getModulesBySystem(modules, 8),
                queue: getModulesBySystem(modules, 9),
            };

            setState(newState);
        }
    }, [modules, userMenus, checkHideDisabled]);

    useMemo(() => {
        showColumnTwo = state.backOffice.length > 0 || state.sap.length > 0 || state.ipd.length > 0 || state.emr.length > 0;
        showColumnThree = state.doc.length > 0 || state.kiosk.length > 0 || state.queue.length > 0;
    }, [state])

    return (
        <>
            {systems.length === 0 ? (
                <>
                    <br />
                    <CardNoRows />
                </>
            ) : (
                <Grid container spacing={2} pt={2}>
                    {state.his.length > 0 && (
                        <Grid xs={12} md={6} lg={4}>
                            <SystemAccordion
                                initSystem={hisSystem}
                                propertyList={
                                    <PropertyList>
                                        {state.his.map((v) => {

                                            return (
                                                <PropertyListItem
                                                    key={v.id}
                                                    label={formatModuleName(
                                                        v.name,
                                                        v.nameEn
                                                    )}
                                                    isHis
                                                    disabled={v.disabled}
                                                    href={v.href}
                                                />
                                            );
                                        })}
                                    </PropertyList>
                                }
                            />
                        </Grid>
                    )}

                    {showColumnTwo && <Grid xs={12} md={6} lg={4}>
                        {state.backOffice.length > 0 && (
                            <SystemAccordion
                                initSystem={backOfficeSystem}
                                propertyList={
                                    <PropertyList>
                                        {state.backOffice.map((v) => (
                                            <PropertyListItem
                                                key={v.id}
                                                label={formatModuleName(v.name, v.nameEn)}
                                                href={v.path}
                                                disabled={!v.path}
                                            // disabled={v.path ? false : true}
                                            />
                                        ))}
                                    </PropertyList>
                                }
                            />
                        )}

                        {state.sap.length > 0 && (
                            <SystemAccordion
                                initSystem={sapSystem}
                                propertyList={
                                    <PropertyList>
                                        {state.sap.map((v) => (
                                            <PropertyListItem
                                                key={v.id}
                                                label={formatModuleName(v.name, v.nameEn)}
                                                href={v.path}
                                                disabled
                                            />
                                        ))}
                                    </PropertyList>
                                }
                                disabled
                            />
                        )}

                        {state.ipd.length > 0 && (
                            <SystemAccordion
                                initSystem={ipdSystem}
                                propertyList={
                                    <PropertyList>
                                        {state.ipd.map((v) => (
                                            <PropertyListItem
                                                key={v.id}
                                                label={formatModuleName(v.name, v.nameEn)}
                                                href={v.path}
                                                disabled={!v.path}
                                            />
                                        ))}
                                    </PropertyList>
                                }
                            />
                        )}

                        {state.emr.length > 0 && (
                            <SystemAccordion
                                initSystem={emrSystem}
                                propertyList={
                                    <PropertyList>
                                        {state.emr.map((v) => (
                                            <PropertyListItem
                                                key={v.id}
                                                label={formatModuleName(v.name, v.nameEn)}
                                                href={v.path}
                                                disabled
                                            />
                                        ))}
                                    </PropertyList>
                                }
                                disabled
                            />
                        )}
                    </Grid>}

                    {showColumnThree && <Grid xs={12} md={6} lg={4}>
                        {state.doc.length > 0 && (
                            <SystemAccordion
                                initSystem={docManagementSystem}
                                propertyList={
                                    <PropertyList>
                                        {state.doc.map((v) => {
                                            const findMenu = userMenus.find(
                                                (m) => m.seq === v.code
                                            );

                                            return (
                                                <PropertyListItem
                                                    key={v.id}
                                                    label={formatModuleName(v.name, v.nameEn)}
                                                    disabled={!findMenu}

                                                />
                                            )
                                        })}
                                    </PropertyList>
                                }
                            />
                        )}

                        {state.kiosk.length > 0 && (
                            <SystemAccordion
                                initSystem={kioskSystem}
                                propertyList={
                                    <PropertyList>
                                        {state.kiosk.map((v) => (
                                            <PropertyListItem
                                                key={v.id}
                                                label={formatModuleName(v.name, v.nameEn)}
                                                href={v.path}
                                                disabled
                                            />
                                        ))}
                                    </PropertyList>
                                }
                                disabled
                            />
                        )}

                        {state.queue.length > 0 && (
                            <SystemAccordion
                                initSystem={queueSystem}
                                propertyList={
                                    <PropertyList>
                                        {state.queue.map((v) => (
                                            <PropertyListItem
                                                key={v.id}
                                                label={formatModuleName(v.name, v.nameEn)}
                                                href={v.path}
                                                disabled
                                            />
                                        ))}
                                    </PropertyList>
                                }
                                disabled
                            />
                        )}
                    </Grid>}
                </Grid>
            )}
        </>
    )
}

export default MenuCardContent