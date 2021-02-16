import CheckmarkIcon from "./icons/checkmark.svg";
import CopyIcon from "./icons/copy.svg";
import InfoIcon from "./icons/info.svg";
import MergeIcon from "./icons/merge.svg";
import MoveIcon from "./icons/move.svg";
import RemoveIcon from "./icons/remove.svg";
import SettingsIcon from "./icons/settings.svg";
import UnmergeIcon from "./icons/unmerge.svg";
import DeleteIcon from "./icons/delete.svg";
import CutIcon from "./icons/scissors.svg";
import React from "react";

const ActionsPanel = ({
  selectedItemsLength,
  activeButton,
  setActiveButton,
  handleSelectAll,
  handleUnselectAll,
  handleDelete,
  setJoinAdjacent,
  joinAdjacent,
}) => {
  return (
    <div className="d-flex user-select-none align-items-center" style={{ height: 59 }}>
      <div className="d-flex align-items-center" style={{ opacity: selectedItemsLength ? 1 : 0 }}>
        <div className="mr-3">
          <img
            alt="delete"
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
            alt="remove"
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
            alt="copy"
            className={`icon-btn ${activeButton === "copy" ? "icon-btn-active" : ""}`}
            onClick={() => setActiveButton(activeButton === "copy" ? "" : "copy")}
            src={CopyIcon}
          ></img>
        </div>
        <div className="pr-3 mr-3" style={{ borderRight: "2px solid #021A53" }}>
          <img
            alt="move"
            className={`icon-btn ${activeButton === "move" ? "icon-btn-active" : ""}`}
            onClick={() => setActiveButton(activeButton === "move" ? "" : "move")}
            src={MoveIcon}
          ></img>
        </div>
      </div>
      {!joinAdjacent ? (
        <div className="mr-3">
          <img
            alt="merge"
            onClick={() => {
              setJoinAdjacent(true);
              handleUnselectAll();
            }}
            className={`icon-btn`}
            src={MergeIcon}
          ></img>
        </div>
      ) : (
        <div className="mr-3">
          <img
            alt="unmerge"
            onClick={() => {
              setJoinAdjacent(false);
              handleUnselectAll();
            }}
            className={`icon-btn`}
            src={UnmergeIcon}
          ></img>
        </div>
      )}
      <div className="mr-3">
        <img
          alt="cut"
          src={CutIcon}
          onClick={() => {
            setActiveButton((prev) => (prev === "cut" ? "" : "cut"));
          }}
          className={`icon-btn ${activeButton === "cut" ? "icon-btn-active" : ""}`}
        ></img>
      </div>

      <div className="mr-3">
        <img
          alt="select all"
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
          <img
            alt="info"
            src={InfoIcon}
            className="icon-btn"
            onClick={() => setActiveButton("info")}
          ></img>
        </div>
      ) : (
        ""
      )}
      {activeButton !== "settings" ? (
        <div>
          <img
            alt="settings"
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
