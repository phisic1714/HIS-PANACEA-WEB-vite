import { Row } from 'antd'
import React from 'react'

export default function GenRow({
    gutter = [8, 8],
    rowStyles = {},
    style = {},
    className = "",
    align = "",
    ...props
}) {
    return <Row
        align={align}
        gutter={gutter}
        style={{ flexDirection: "row", ...rowStyles, ...style }}
        className={`${className}`}
        {...props}
    />
}
