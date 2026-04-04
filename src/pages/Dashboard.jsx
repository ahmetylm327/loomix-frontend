import React, { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Typography, Spin } from 'antd';
import { UserOutlined, ShopOutlined, BoxPlotOutlined, WalletOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';

const { Title } = Typography;

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await axiosInstance.get('/stats');
                setStats(res.data);
            } catch (error) {
                console.error("Dashboard yüklenemedi");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) return <div style={{ textAlign: 'center', marginTop: 50 }}><Spin size="large" /></div>;
    console.log("Şu an stats içinde ne var?:", stats);
    return (
        <div style={{ padding: '30px' }}>
            <Title level={2} style={{ marginBottom: 25 }}>Atölye Genel Özet</Title>

            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Aktif Personel"
                            value={stats?.personelSayisi}
                            prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                        /></Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Toplam Firma (Cari)"
                            value={stats?.cariSayisi}
                            prefix={<ShopOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                        <Statistic
                            title="Tanımlı Ürün"
                            value={stats?.urunSayisi}
                            prefix={<BoxPlotOutlined style={{ color: '#faad14' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card variant="borderless" style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)', background: '#fff1f0' }}>
                        <Statistic
                            title="Toplam Personel Borcu"
                            value={stats?.toplamBorc}
                            precision={2}
                            suffix="₺"
                            styles={{ content: { color: '#cf1322' } }}
                            prefix={<WalletOutlined />}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Buraya ileride grafikler (Chart.js / Ant Design Charts) gelecek */}
            <Card style={{ marginTop: 30, textAlign: 'center', color: '#8c8c8c' }}>
                <p>Grafik ve Analiz Modülleri Çok Yakında!</p>
            </Card>
        </div>
    );
};

export default Dashboard;