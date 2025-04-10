import React from 'react';
import styled from 'styled-components'

const DivStyle = styled.div`
    ::-webkit-scrollbar {
        position: absolute;
        width: 7px;
        height: 7px;
        padding: 0%;
        border: 1px solid transparent;
        opacity: 0.75;
    }
    ::-webkit-scrollbar-track{
        background: #f1f1f1; 
    }
    ::-webkit-scrollbar-thumb {
        border-radius: 100px;
        border: 1.3px solid transparent;
        background: #c1c1c1  ;
    }
    ::-webkit-scrollbar-thumb:hover{
        background: #c1c1c1  ;
    }
`;

export function DivScrollY({ children, height, paddingLeft=8, paddingRight=8 }){
    return (
        <DivStyle style={{ height: height, overflowX: "hidden", overflowY: "auto", paddingLeft: paddingLeft, paddingRight: paddingRight }}>
            {children}
        </DivStyle>
    )
}

export function DivScrollX({ children, width, paddingLeft=8 }){
    return (
        <DivStyle style={{ overflowX: "auto", overflowY: "hidden" }}>
            <div style={{ width: width, paddingLeft: paddingLeft }}> 
                {children}
            </div>
        </DivStyle>
    )
}

export function DivScrollXY({ children, height, width, paddingLeft=8, paddingRight=8 }){
    return (
        <DivStyle style={{ overflowX: "auto", overflowY: "auto", height: height, paddingLeft: paddingLeft, paddingRight: paddingRight }}>
            <div style={{ width: width, paddingLeft: paddingLeft }}> 
                {children}
            </div>
        </DivStyle>
    )
}