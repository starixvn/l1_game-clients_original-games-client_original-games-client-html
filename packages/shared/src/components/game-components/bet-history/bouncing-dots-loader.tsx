import React from "react";
import styles from "./bouncing-dots-loader.module.scss";

const BouncingDotsLoader = (props) => {
  return (
      <div className={styles["bouncing-loader"]}>
        <div></div>
        <div></div>
        <div></div>
      </div>
  );
};

export default BouncingDotsLoader;