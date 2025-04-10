import {useState, useEffect} from 'react';
// import throttle from 'lodash.throttle';
import {throttle} from "lodash";


const getDeviceConfig = (width) => {
  if(width < 576) {
    return 'xs';
  } else if(width >= 576 && width < 768 ) {
    return 'sm';
  } else if(width >= 768 && width < 992) {
    return 'md';
  } else if(width >= 992 && width < 1200 ) {
    return 'lg';
  } else if(width >= 1200&& width < 1600) {
    return 'xl';
  } else if(width >= 1600) {
    return 'xxl';
  }  
};

const useBreakpoint = () => {
  const [brkPnt, setBrkPnt] = useState(() => getDeviceConfig(window.innerWidth));
  
  useEffect(() => {
    const calcInnerWidth = throttle(function() {
      setBrkPnt(getDeviceConfig(window.innerWidth))
    }, 200); 
    window.addEventListener('resize', calcInnerWidth);
    return () => window.removeEventListener('resize', calcInnerWidth);
  }, []);

  return brkPnt;
}
export default useBreakpoint;