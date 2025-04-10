import { env } from '../../env.js';
import React from "react";
import { ReactSVG } from "react-svg";
import styled, { css } from "styled-components";
const StyledSVGIcon = styled(ReactSVG)`
  svg {
    fill: black;
    ${({
  size
}) => size && css`
        width: ${size};
        height: ${size};
      `}
    ${({
  transform
}) => transform && css`
        transform: ${transform};
      `}
      polygon,path,g,polyline,circle,line,rect {
        ${({
  color
}) => color && css`
            stroke: ${color};
          `}
      }
  }
`;
const Icon = props => {
  console.log(props);
  return <StyledSVGIcon src={`${env.PUBLIC_URL}/assets/images/menuiconsvg/${props.name}.svg`} color={props.color} size={props.size} transform={props.transform} />;
};
export default Icon;