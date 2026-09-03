import React from "react";
import "./loading.scss";

const Loading = ({ message = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="loading-spinner__ring">
          <div className="loading-spinner__ring-inner" />
        </div>
        <div className="loading-spinner__pulse" />
      </div>
      <p className="loading-message">{message}</p>
      <div className="loading-dots">
        <span className="loading-dots__dot" />
        <span className="loading-dots__dot" />
        <span className="loading-dots__dot" />
      </div>
    </div>
  );
};

export default Loading;
