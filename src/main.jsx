// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import store from "./app/store"; // redux store
import App from "./App";
import disableDevtool from "disable-devtool";

import "./index.css"; // tailwind entry

// Khóa DevTools chỉ trên production
if (import.meta.env.PROD) {
  disableDevtool({
    ondevtoolopen: () => {
      window.location.replace("/");
    },
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>
);
