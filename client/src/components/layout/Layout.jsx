import React from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar />
      <div
        style={{
          marginLeft: "var(--sidebar-width)",
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh"
        }}
      >
        <Topbar />
        <main
          style={{
            flex: 1,
            padding: "40px",
            maxWidth: "calc(var(--content-max) + 80px)",
            width: "100%"
          }}
        >
          <div style={{ maxWidth: "var(--content-max)", margin: "0 auto" }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
