"use client"
import { Layout, Table, Tag, Typography, Space, DatePicker, Dropdown, Button } from "antd";
import { DownOutlined, FilterOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import "./page.css";
import { useEffect, useState } from "react";
import axios from "axios";
import LaunchDetailsModal from "@/component/LaunchDetailsModal";

const { Header, Content } = Layout;

const datePresets = [
  { label: 'Past week', value: [dayjs().subtract(1, 'week'), dayjs()] },
  { label: 'Past month', value: [dayjs().subtract(1, 'month'), dayjs()] },
  { label: 'Past 3 months', value: [dayjs().subtract(3, 'month'), dayjs()] },
  { label: 'Past 6 months', value: [dayjs().subtract(6, 'month'), dayjs()] },
  { label: 'Past year', value: [dayjs().subtract(1, 'year'), dayjs()] },
  { label: 'Past 2 years', value: [dayjs().subtract(2, 'year'), dayjs()] },
];

export default function Home() {
  const [launches, setLaunches] = useState([]);
  const [rockets, setRockets] = useState({});
  const [launchpads, setLaunchpads] = useState({});
  const [payloads, setPayloads] = useState({});
  const [selectedMenu, setSelectedMenu] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);
  const [presetRange, setPresetRange] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedLaunch, setSelectedLaunch] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);


  const onRowClick = (record) => {
    const rocket = rockets[record.rocket] || {};
    const launchpad = launchpads[record.launchpad] || {};
    const payloadObjs = (record.payloads || []).map(pid => payloads[pid] || {});

    const launchDetails = {
      ...record,
      rocket,
      launchpad,
      payloads: payloadObjs,
      rocket_name: rocket.name || record.rocket_name || '',
      rocket_type: rocket.type || record.rocket_type || '',
      manufacturer: rocket.manufacturer || '',
      nationality: rocket.nationality || '',
      launch_site: { site_name: launchpad.name || launchpad.site_name || '' },
    };
    setSelectedLaunch(launchDetails);
    setModalVisible(true);
  };


  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [launchRes, rocketRes, padRes, payloadRes] = await Promise.all([
          axios.get("https://api.spacexdata.com/v4/launches"),
          axios.get("https://api.spacexdata.com/v4/rockets"),
          axios.get("https://api.spacexdata.com/v4/launchpads"),
          axios.get("https://api.spacexdata.com/v4/payloads"),
        ]);

        const rocketMap = {};
        rocketRes.data.forEach((r) => (rocketMap[r.id] = {name : r.name , type : r.type , manufacturer : r.company , nationality : r.country}));

        const padMap = {};
        padRes.data.forEach((p) => (padMap[p.id] = p.name));

        const payloadMap = {};
        payloadRes.data.forEach((p) => (payloadMap[p.id] = { name: p.name, orbit: p.orbit, type: p.type }));

        setLaunches(launchRes.data);
        setRockets(rocketMap);
        setLaunchpads(padMap);
        setPayloads(payloadMap);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const columns = [
    {
      title: "No:",
      key: "index",
      render: (_, __, index) => `${(index + 1).toString().padStart(2, "0")}`,
    },
    {
      title: "Launched (UTC)",
      dataIndex: "date_utc",
      key: "date",
      render: (date) => dayjs(date).format("DD MMMM YYYY [at] HH:mm"),
    },
    {
      title: "Location",
      dataIndex: "launchpad",
      key: "location",
      render: (id) => launchpads[id] || "Unknown",
    },
    {
      title: "Mission",
      dataIndex: "name",
      key: "mission",
    },
    {
      title: "Orbit",
      dataIndex: "payloads",
      key: "orbit",
      render: (payloadIds) => {
        const orbits = payloadIds.map((id) => payloads[id]?.orbit).filter(Boolean);
        return [...new Set(orbits)].join(", ") || "-";
      },
    },
    {
      title: "Launch Status",
      dataIndex: "upcoming",
      key: "status",
      render: (upcoming, record) => {
        const success = record?.success;
        if (upcoming) return (
          <Tag style={{ color: "#92400F", backgroundColor: "#FEF3C7", border: 'none', fontWeight: 'bold' }}>
            Upcoming
          </Tag>
        );
        if (success) return (
          <Tag style={{ color: "#03543F", backgroundColor: "#DEF7EC", border: 'none', fontWeight: 'bold' }}>
            Success
          </Tag>
        );
        return (
          <Tag style={{ color: "#981B1C", backgroundColor: "#FDE2E1", border: 'none', fontWeight: 'bold' }}>
            Failed
          </Tag>
        )
      },
    },
    {
      title: "Rocket",
      dataIndex: "rocket",
      key: "rocket",
      render: (id) => rockets[id].name || "Unknown",
    },
  ];

  const menuItems = [
    { key: "all", label: "All Launches" },
    { key: "success", label: "Success" },
    { key: "failed", label: "Failed" },
    { key: "upcoming", label: "Upcoming" },
  ];

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
  };

  const menuProps = {
    items: menuItems,
    onClick: handleMenuClick,
    selectedKeys: [selectedMenu],
  };

  const filteredLaunches = launches.filter((launch) => {
    const launchDate = dayjs(launch.date_utc);
    let dateMatch = true;
    if (presetRange) {
      const [start, end] = presetRange;
      dateMatch = (launchDate.isSame(start, 'day') || launchDate.isAfter(start, 'day')) &&
        (launchDate.isSame(end, 'day') || launchDate.isBefore(end, 'day'));
    } else if (selectedDate) {
      dateMatch = launchDate.isSame(selectedDate, 'day');
    }
    if (selectedMenu === "all") return dateMatch;
    if (selectedMenu === "success") return launch.success && !launch.upcoming && dateMatch;
    if (selectedMenu === "failed") return launch.success === false && !launch.upcoming && dateMatch;
    if (selectedMenu === "upcoming") return launch.upcoming && dateMatch;
    return dateMatch;
  });

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header
        style={{
          background: "white",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: 64,
          borderBottom: "1px solid #e8e8e8",
        }}
      >
        <img src="/logo.png" alt="logo" style={{ height: 24 }} />
      </Header>

      <Content
        style={{
          padding: "0 150px",
          fontSize: 12,
          background: "white",
        }}
      >
        <div className="flex justify-between items-center mb-10 mt-10 text-xs no-filter-border">

          <Dropdown
            trigger={["click"]}
            overlayClassName="no-filter-border"
            placement="bottomLeft"
            popupRender={() => (
              <div style={{
                background: 'white',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                padding: 0,
                minWidth: 520,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'stretch',
              }}>
                <div style={{
                  minWidth: 160,
                  borderRight: '1px solid #e5e7eb',
                  padding: '18px 0 18px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  justifyContent: 'flex-start',
                }}>
                  <div
                    style={{
                      padding: '8px 24px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      color: !selectedDate && !presetRange ? '#1677ff' : '#374151',
                      borderRadius: 6,
                      background: !selectedDate && !presetRange ? '#e6f4ff' : 'transparent',
                      marginBottom: 2,
                    }}
                    onClick={() => {
                      setSelectedDate(null);
                      setPresetRange(null);
                    }}
                    onMouseDown={e => e.preventDefault()}
                  >
                    All Data
                  </div>
                  {datePresets.map((preset, idx) => (
                    <div
                      key={preset.label}
                      style={{
                        padding: '8px 24px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        color: presetRange && presetRange[0].isSame(preset.value[0], 'day') && presetRange[1].isSame(preset.value[1], 'day') ? '#1677ff' : '#374151',
                        borderRadius: 6,
                        background: presetRange && presetRange[0].isSame(preset.value[0], 'day') && presetRange[1].isSame(preset.value[1], 'day') ? '#e6f4ff' : 'transparent',
                        marginBottom: idx !== datePresets.length - 1 ? 2 : 0,
                      }}
                      onClick={() => {
                        setSelectedDate(null);
                        setPresetRange(preset.value);
                      }}
                      onMouseDown={e => e.preventDefault()}
                      className="date-preset-item"
                    >
                      {preset.label}
                    </div>
                  ))}
                </div>
                <div style={{ padding: 18, flex: 1 }}>
                  <DatePicker
                    value={selectedDate}
                    onChange={date => {
                      setSelectedDate(date);
                      setPresetRange(null);
                    }}
                    size="small"
                    style={{ border: 'none', boxShadow: 'none', minWidth: 320 }}
                    className="no-filter-border"
                    format="DD MMMM YYYY"
                    disabledDate={date => date.isAfter(dayjs())}
                    getPopupContainer={trigger => trigger.parentNode}
                    allowClear={false}
                    panelRender={panel => (
                      <div style={{ display: 'flex', gap: 24 }}>{panel}</div>
                    )}
                  />
                </div>
              </div>
            )}
          >
            <Button size="small" style={{ border: 'none', boxShadow: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
              Date & Filters <DownOutlined style={{ fontSize: 12, marginLeft: 4 }} />
            </Button>
          </Dropdown>

          <Dropdown
            menu={menuProps}
            placement="bottomLeft"
            arrow
            overlayClassName="no-filter-border"
          >
            <Button size="small" style={{ border: 'none', boxShadow: 'none', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 8 }}>
              <FilterOutlined style={{ fontSize: 14 }} />
              {menuItems.find((item) => item.key === selectedMenu)?.label || "All Launches"}
              <DownOutlined style={{ fontSize: 12, marginLeft: 4 }} />
            </Button>
          </Dropdown>
        </div>

        <Table
          columns={columns}
          dataSource={filteredLaunches}
          rowKey="id"
          pagination={{ pageSize: 12, showSizeChanger: false }}
          size="small"
          scroll={{ x: true }}
          style={{ fontSize: 12, border: 'none' , cursor: 'pointer' }}
          bordered={false}
          className="no-table-border"
          loading={loading}
          onRow={(record) => {
            return {
              onClick: () => onRowClick(record),
            };
          }}
          locale={{
            emptyText: loading
              ? null
              : (
                <div style={{ padding: '32px 0', color: '#888', fontWeight: 500, fontSize: 15 }}>
                  No results found for the specified filter
                </div>
              )
          }}
        />
        <LaunchDetailsModal
          visible={isModalVisible}
          onClose={() => setModalVisible(false)}
          launchDetails={selectedLaunch}
        />
      </Content>

    </Layout>
  );
}