import React,{useState,useImperativeHandle, forwardRef} from "react";
import { Icon } from "@iconify/react";
import circleChevronUpFill from '@iconify/icons-akar-icons/circle-chevron-up-fill';
import "./back-to-top.less";

export default forwardRef(function BackToTop({ refprop },ref) {
  const scrollRef = refprop;
  const [hiddenBack,setHiddenBack]=useState(true);

  useImperativeHandle(ref, () => ({
    onScroll: (props) => onScroll(props)
  }));

  const scrollToTop = () => {
    scrollRef?.current.scrollIntoView({ top: 0, behavior: "smooth" });
  };
  const onScroll = e => {
    // console.log(e.target.scrollTop);
    setHiddenBack(e.target.scrollTop===0);
  };

  return (
    <div className="btn-back-to-top" hidden={hiddenBack}>
      <Icon
        icon={circleChevronUpFill}
        color="var(--primary-color)"
        width={40}
        height={40}
        onClick={() => scrollToTop()}
      />
    </div>
  );
})
