export const mappingOptions = ({
    dts = [],
    valueField = "datavalue",
    labelField = "datadisplay",
    compound = false
}) => {
    if (!dts?.length) return []
    const mapping = dts?.map((o, i) => {
        const value = o[valueField]
        const label = compound ? `${o[valueField]} ${o[labelField]}` : o[labelField]
        return {
            ...o,
            key: String(i),
            value: String(value),
            label,
            className: "data-value",
        }
    })
    return mapping
}