import React from "react";

const CustomDrawer = ({ children, isOpen, isRemoveFinished }) => {
  return (
    <div
      className={`row no-gutters w-100 position-${
        !isRemoveFinished ? "relative" : "absolute"
      } h-100`}
      style={{
        transition: "background 0.3s",
        background: `rgba(0,0,0,${isOpen ? 0.3 : 0})`,
        top: 0,
        zIndex: !isRemoveFinished ? 2 : -2,
        overflowX: "hidden",
        overflowY: isOpen ? "auto" : "hidden",
      }}
    >
      <div className="col-auto" style={{ width: "15%" }}></div>
      <div
        className="col bg-white"
        style={{
          transition: "transform 0.3s",
          transform: `translateX(${isOpen ? 0 : "100%"})`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default CustomDrawer;
