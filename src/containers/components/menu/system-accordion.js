import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Accordion,
  AccordionSummary,
  SvgIcon,
  Typography
} from "@mui/material";
import { useState } from "react";

export const SystemAccordion = ({ initSystem, propertyList, disabled }) => {
  const [system, setSystem] = useState(initSystem);

  return (
    <Accordion
      expanded={system.expanded}
      key={system.id}
      sx={{
        boxShadow: "rgba(0, 0, 0, 0.08) 0px 4px 18px;",
      }}
    >
      <AccordionSummary
        expandIcon={
          <SvgIcon>
            <ExpandMoreIcon sx={{ backgroundColor: "white", color: "white" }} />
          </SvgIcon>
        }
        onClick={() => setSystem((p) => ({ ...p, expanded: !p.expanded }))}
        aria-controls="panel1a-content"
        id="panel1a-header"
        sx={{
          backgroundColor: disabled ? "divider" : "primary.main",
        }}
      >
        <Typography variant="h6" color={disabled ? "grey" : "white"}>{system.name}</Typography>
      </AccordionSummary>

      {system.expanded && <>{propertyList}</>}
    </Accordion>
  );
};
