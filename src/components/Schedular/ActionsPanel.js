import CheckmarkIcon from "./icons/checkmark.svg";
import CopyIcon from "./icons/copy.svg";
import InfoIcon from "./icons/info.svg";
import MergeIcon from "./icons/merge.svg";
import MoveIcon from "./icons/move.svg";
import RemoveIcon from "./icons/remove.svg";
import SettingsIcon from "./icons/settings.svg";
import UnmergeIcon from "./icons/unmerge.svg";
import DeleteIcon from "./icons/delete.svg";
import React from "react";

const ActionsPanel = ({
  selectedItemsLength,
  activeButton,
  setActiveButton,
  handleSelectAll,
  handleUnselectAll,
  handleDelete,
  handleMerge,
}) => {
  return (
    <div className="d-flex user-select-none align-items-center" style={{ height: 59 }}>
      {selectedItemsLength ? (
        <React.Fragment>
          <div className="mr-3">
            <img
              className={"icon-btn"}
              onClick={() => {
                handleDelete();
                setActiveButton("remove");
              }}
              src={DeleteIcon}
            ></img>
          </div>
          <div className="mr-3">
            <img
              className={"icon-btn"}
              onClick={() => {
                handleUnselectAll();
                setActiveButton("unselect");
              }}
              src={RemoveIcon}
            ></img>
          </div>
          <div className="mr-3">
            <img
              className={`icon-btn ${activeButton === "copy" ? "icon-btn-active" : ""}`}
              onClick={() => setActiveButton(activeButton === "copy" ? "" : "copy")}
              src={CopyIcon}
            ></img>
          </div>
          <div className="pr-3 mr-3" style={{ borderRight: "2px solid #021A53" }}>
            <img
              className={`icon-btn ${activeButton === "move" ? "icon-btn-active" : ""}`}
              onClick={() => setActiveButton(activeButton === "move" ? "" : "move")}
              src={MoveIcon}
            ></img>
          </div>
        </React.Fragment>
      ) : (
        ""
      )}
      {selectedItemsLength >= 2 ? (
        <div className="mr-3">
          <img
            onClick={() => {
              setActiveButton("merge");
              handleMerge();
            }}
            className={`icon-btn ${activeButton === "unmerge" ? "icon-btn-active" : ""}`}
            src={MergeIcon}
          ></img>
        </div>
      ) : (
        <div className="mr-3">
          <img
            onClick={() => setActiveButton(activeButton === "unmerge" ? "" : "unmerge")}
            className={`icon-btn ${activeButton === "unmerge" ? "icon-btn-active" : ""}`}
            src={UnmergeIcon}
          ></img>
        </div>
      )}

      <div className="mr-3">
        <img
          src={CheckmarkIcon}
          onClick={() => {
            handleSelectAll();
            setActiveButton("checkmark");
          }}
          className="icon-btn"
        ></img>
      </div>
      {activeButton !== "info" ? (
        <div className="mr-3">
          <img src={InfoIcon} className="icon-btn" onClick={() => setActiveButton("info")}></img>
        </div>
      ) : (
        ""
      )}
      {activeButton !== "settings" ? (
        <div>
          <img
            src={SettingsIcon}
            className="icon-btn"
            onClick={() => setActiveButton("settings")}
          ></img>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default ActionsPanel;
