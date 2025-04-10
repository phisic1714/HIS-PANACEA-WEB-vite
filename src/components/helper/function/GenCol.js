import { Col } from 'antd'
import React from 'react'
export default function GenCol(
    {
        noSpan = false,
        fixSpan = false,
        span = 24,
        xxl = 0,
        xl = 0,
        lg = 6,
        md = 8,
        sm = 12,
        xs = 24,
        syles = {},
        className = "",
        ...props
    }
) {
    const manageSpan = noSpan ? {} : {
        span: span,
        xxl: fixSpan ? span : xxl || span,
        xl: fixSpan ? span : xl || span,
        lg: fixSpan ? span : lg,
        md: fixSpan ? span : md,
        sm: fixSpan ? span : sm,
        xs: fixSpan ? span : xs,
    }
    return (
        <Col
            style={{ ...syles }}
            className={`${className}`}
            {...props}
            {...manageSpan}
        />
    )
}
