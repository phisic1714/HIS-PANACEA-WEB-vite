import React from "react";
// import ReactDOM from "react-dom";

import NextApp from "./NextApp";
import * as serviceWorker from "./registerServiceWorker";
import "react-app-polyfill/ie11";
import "react-app-polyfill/stable";
import { createRoot } from "react-dom/client";
// eslint-disable-next-line no-undef
if (
  process.env.NODE_ENV !== "development" &&
  localStorage.getItem("showConsole") !== "show"
)
  console.log = () => {};

// ReactDOM.render(<NextApp />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
console.log("d :>> ");
const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<NextApp />);
serviceWorker.unregister();
