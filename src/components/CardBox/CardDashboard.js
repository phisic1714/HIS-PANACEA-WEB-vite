import React, { useState } from "react";
import PropTypes from "prop-types";

const CardDashboard =
    ({ height, border, borderRadius, cardColor, children,
        marginLeft, marginRight, title, hoverable, layout, onClick, active, activeColor,style,filterTypeName
    }) => {
        const [hover, setHover] = useState(false);
        return (
            <div style={{
                width: "100%", height: `${height}`,
                // border: active && cardColor === "" ? "black solid 1px" : active && cardColor !== "" ? `solid 1px ${activeColor}` : border,
                // border: (active === filterTypeName) ? "black solid 1px" : border,
                border: filterTypeName ? 
                    ((active === filterTypeName) ? "black solid 1px" : border)
                    :
                    (active && cardColor === "" ? "black solid 1px" : active && cardColor !== "" ? `solid 1px ${activeColor}` : border) ,
                backgroundColor: cardColor,
                borderRadius: borderRadius === true ? "10px" : "",
                display: "flex",
                flexFlow: layout === "vertical" ? "column wrap" : "",
                justifyContent: "center",
                cursor: hover ? "pointer" : "",
                // borderColor: active ? "black" : "white",
                transition: "box-shadow 0.3s, border-color 0.3s",
                boxShadow: hover ? "rgba(14, 30, 37, 0.12) 0px 2px 4px 0px, rgba(14, 30, 37, 0.32) 0px 2px 16px 0px" : "",
                ...style
            }}
                // onMouseEnter={() => setActiveClass("card-dashboard active")}
                onMouseEnter={() => hoverable ? setHover(true) : setHover(false)}
                onMouseLeave={() => setHover(false)}
                onClick={onClick}
                
            // className={activeClass}
            >
                {
                    layout === "" || layout === "horizontal" ?
                        <>
                            <div style={{ display: "flex", width: "50%", alignItems: "center", marginLeft: marginLeft }}>
                                {title}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", marginLeft: "auto", marginRight: marginRight }}>
                                {children}
                            </div>
                        </>
                        :
                        <>
                            <div style={{ display: "flex", width: "100%", height: "50%", justifyContent: "center", alignItems: "center" }}>
                                {title}
                            </div>
                            <div style={{ display: "flex", width: "100%", height: "50%", justifyContent: "center", alignItems: "center" }}>
                                {children}
                            </div>
                        </>
                }
            </div>
        )
    };

CardDashboard.propTypes = {
    height: PropTypes.string,
    border: PropTypes.string,
    borderRadius: PropTypes.bool,
    cardColor: PropTypes.string,
    marginLeft: PropTypes.number,
    marginRight: PropTypes.number,
    title: PropTypes.object,
    hoverable: PropTypes.bool,
    layout: PropTypes.string,
    active: PropTypes.bool,
    activeColor: PropTypes.string,
};

CardDashboard.defaultProps = {
    height: "100px",
    border: "#e8e8e8 solid 1px",
    borderRadius: true,
    cardColor: "",
    marginLeft: 12,
    marginRight: 12,
    title: '',
    hoverable: false,
    layout: "horizontal",
    active: false,
    activeColor: "black"
};


export default CardDashboard;

