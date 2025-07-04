
import { Modal, Tag, Descriptions, Typography, Space, Image } from 'antd';
import { YoutubeOutlined, GlobalOutlined, InfoCircleOutlined } from '@ant-design/icons';
import './LaunchDetailsModal.css';

const { Title, Paragraph, Link } = Typography;

const LaunchDetailsModal = ({ visible, onClose, launchDetails }) => {
  if (!launchDetails) return null;

  const {
    links = {},
    name,
    flight_number,
    success,
    details,
    launch_date_utc,
    payloads = [],
    rocket_name,
    rocket_type,
    manufacturer,
    nationality,
    launchpad
  } = launchDetails;

  console.log(launchDetails);
  


  const payload = payloads && payloads.length > 0 ? payloads[0] : {};
  const statusColor = success ? '#22C55E' : '#F87171';
  const statusBg = success ? '#D1FADF' : '#FEE2E2';
  const statusText = success ? 'Success' : 'Failed';

  return (
    <Modal open={visible} onCancel={onClose} footer={null} width={520} className="launch-details-modal">
      <div className="ldm-container">
        <div className="ldm-header">
          <img
            src={links.patch?.small}
            width={64}
            height={64}
            alt="mission patch"
          />
          <div className="ldm-title-block">
            <div className="ldm-title-row">
              <Title level={4} className="ldm-title">{name}</Title>
              <span className="ldm-status" style={{ background: statusBg, color: statusColor }}>{statusText}</span>
            </div>
            <div className="ldm-rocket">{rocket_name}</div>
            <div className="ldm-links">
              {links.wikipedia && (
                <Link href={links.wikipedia} target="_blank" className="ldm-link"><img className='w-4' src='/wiki.png'/></Link>
              )}
              {links.wikipedia && (
                <Link href={links.wikipedia} target="_blank" className="ldm-link"><img className='w-4' src='/nasa.png'/></Link>
              )}
              {links.webcast && (
                <Link href={links.webcast} target="_blank" className="ldm-link"><img className='w-4' src='/youtube.png'/></Link>
              )}
            </div>
          </div>
        </div>
        <Paragraph className="text-lg">
          {details}
          {links.wikipedia && (
            <Link className='ml-2' href={links.wikipedia} target="_blank">Wikipedia</Link>
          )}
        </Paragraph>
        <Descriptions column={1} className="ldm-desc" labelStyle={{ width: 160, fontWeight: 500, color: '#6B7280' }} contentStyle={{ color: '#111827' }}>
          <Descriptions.Item label="Flight Number">{flight_number}</Descriptions.Item>
          <Descriptions.Item label="Mission Name">{name}</Descriptions.Item>
          <Descriptions.Item label="Rocket Type">{rocket_type}</Descriptions.Item>
          <Descriptions.Item label="Rocket Name">{rocket_name}</Descriptions.Item>
          <Descriptions.Item label="Manufacturer">{manufacturer || payload.manufacturer || payload.manufacturers?.join(', ')}</Descriptions.Item>
          <Descriptions.Item label="Nationality">{nationality || payload.nationality || payload.nationalities?.join(', ')}</Descriptions.Item>
          <Descriptions.Item label="Launch Date">
            {new Date(launch_date_utc).toLocaleString('en-GB', {
              day: '2-digit',
              month: 'long',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Descriptions.Item>
          <Descriptions.Item label="Payload Type">{payload.type}</Descriptions.Item>
          <Descriptions.Item label="Orbit">{payload.orbit}</Descriptions.Item>
          <Descriptions.Item label="Launch Site">{launchpad}</Descriptions.Item>
        </Descriptions>
      </div>
    </Modal>
  );
};

export default LaunchDetailsModal;
