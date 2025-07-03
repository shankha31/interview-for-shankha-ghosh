"use client";

import { Layout, Menu, Typography } from "antd";

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

export default function Home() {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header className="flex justify-center align-bottom" style={{ background: "white" }}>
        <div className="flex justify-center items-end pb-4" style={{ color: "#fff", fontSize: 18 }}>
          <img className="h-6" src="/logo.png" alt="logo"/>
        </div>
      </Header>
      <Content style={{ padding: "24px" }}>
        <Title>Welcome to the SpaceX Dashboard</Title>
      </Content>
    </Layout>
  );
}
