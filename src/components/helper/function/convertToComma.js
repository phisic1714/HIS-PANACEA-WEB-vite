import PropTypes from "prop-types";
export default function convertToComma(props) {
    const {
        value,
        minimumFractionDigits=2,
        maximumFractionDigits=2,
        comma=true
      } = props;
    if(comma){
        return  new Intl.NumberFormat("TH", {
            minimumFractionDigits: minimumFractionDigits,
            maximumFractionDigits: maximumFractionDigits,
        })
            .format(value||0)
    }else{
        return  new Intl.NumberFormat("TH", {
            minimumFractionDigits: minimumFractionDigits,
            maximumFractionDigits: maximumFractionDigits,
        })
            .format(value||0)
            .replace(",", "")
    }  
    
}

convertToComma.propTypes = {
    minimumFractionDigits: PropTypes.number,
    maximumFractionDigits: PropTypes.number,
};

