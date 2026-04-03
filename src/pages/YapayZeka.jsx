import React, { useState } from 'react';
import { Card, Typography, Form, Select, Button, Row, Col, Statistic, message, Divider, Spin, Switch, Tooltip } from 'antd';
import { RobotOutlined, AimOutlined, FallOutlined, RiseOutlined, InfoCircleOutlined, LineChartOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';

const { Title, Text } = Typography;
const { Option } = Select;

const YapayZeka = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [tahminVerisi, setTahminVerisi] = useState(null);

    // Backend'deki senin yazdığın tahmin motoruna (tahminYap) istek atar
    const handleTahminOlustur = async (values) => {
        setLoading(true);
        try {
            const payload = {
                forecastPeriod: values.forecastPeriod,
                confidenceLevel: 95, // Varsayılan güven seviyesi
                includeSeasonality: values.includeSeasonality
            };

            const response = await axiosInstance.post('/estimates/ai-forecast', payload);
            setTahminVerisi(response.data);
            message.success("Loomix AI analizi başarıyla tamamladı!");
        } catch (error) {
            if (error.response && error.response.status === 422) {
                message.warning("Analiz için yeterli geçmiş veri bulunamadı! Lütfen önce üretim ve kasa verisi girin.");
            } else {
                message.error("Tahmin motoru çalıştırılırken bir hata oluştu!");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <Card variant="borderless" style={{ marginBottom: 20, background: '#f9f0ff', border: '1px solid #d3adf7' }}>
                <Title level={2} style={{ color: '#531dab' }}>
                    <RobotOutlined style={{ marginRight: '10px' }} /> Loomix AI - Gelecek Tahmin Motoru
                </Title>
                <p style={{ color: '#531dab' }}>Atölyenizin geçmiş üretim hızını, model zorluk derecelerini ve mevsimsel gider trendlerini analiz ederek geleceğe yönelik kapasite ve karlılık projeksiyonu sunar.</p>
                <Divider style={{ borderColor: '#d3adf7' }} />

                {/* Yapay Zeka Parametre Formu */}
                <Form form={form} layout="inline" onFinish={handleTahminOlustur} initialValues={{ forecastPeriod: 'gelecekAy', includeSeasonality: true }}>
                    <Form.Item name="forecastPeriod" label="Tahmin Periyodu" rules={[{ required: true }]}>
                        <Select style={{ width: 180 }}>
                            <Option value="gelecekHafta">Gelecek Hafta</Option>
                            <Option value="gelecekAy">Gelecek Ay</Option>
                            <Option value="gelecekYıl">Gelecek Yıl</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="includeSeasonality" valuePropName="checked">
                        <Tooltip title="Geçmiş aylardaki dalgalanmaları (sezon etkisini) hesaba katar">
                            <Switch checkedChildren="Mevsimsellik Açık" unCheckedChildren="Mevsimsellik Kapalı" />
                        </Tooltip>
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<AimOutlined />} loading={loading} style={{ background: '#722ed1', borderColor: '#722ed1' }}>
                            Yapay Zeka Analizini Başlat
                        </Button>
                    </Form.Item>
                </Form>
            </Card>

            {/* Yükleniyor Animasyonu */}
            {loading && (
                <div style={{ textAlign: 'center', margin: '50px 0' }}>
                    <Spin size="large" description="Geçmiş veriler analiz ediliyor, makine öğrenmesi algoritmaları çalıştırılıyor..." />
                </div>
            )}

            {/* Tahmin Sonuç Ekranı */}
            {tahminVerisi && !loading && (
                <div>
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                            <Card variant="borderless" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                                <Statistic title="Tahmini Üretim (Adet)" value={tahminVerisi.predictedProductionVolume} prefix={<LineChartOutlined />} styles={{ content: { color: '#096dd9' } }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card variant="borderless" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                                <Statistic title="Beklenen Brüt Gelir" value={tahminVerisi.estimatedGrossRevenue} precision={2} suffix="₺" styles={{ content: { color: '#3f8600' } }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card variant="borderless" style={{ background: '#fff2f0', border: '1px solid #ffccc7' }}>
                                <Statistic title="Trende Göre Gider" value={tahminVerisi.projectedExpenses} precision={2} suffix="₺" styles={{ content: { color: '#cf1322' } }} />
                            </Card>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                            <Card variant="borderless" style={{ background: '#fffb8f', border: '1px solid #d4b106' }}>
                                <Statistic title="Yapay Zeka Kar Marjı" value={tahminVerisi.aiProfitMargin} styles={{ content: { color: '#ad8b00', fontWeight: 'bold' } }} />
                                <div style={{ fontSize: '12px', color: 'gray', marginTop: '5px' }}>Analiz Güveni: {tahminVerisi.confidenceScore}</div>
                            </Card>
                        </Col>
                    </Row>

                    {/* Backend'den gelen ekstra detaylı analiz notları */}
                    <Card title={<><InfoCircleOutlined /> Yapay Zeka Analiz Notları</>} variant="borderless" style={{ marginTop: 20, borderTop: '3px solid #722ed1' }}>
                        <p><b>Model Zorluk Etkisi:</b> <Text type="secondary">{tahminVerisi._ekstraAnalizler?.urunZorlukEtkisi}</Text></p>
                        <p><b>Mevsimsel Trend Etkisi:</b> <Text type="secondary">{tahminVerisi._ekstraAnalizler?.sezonTrendEtkisi}</Text></p>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default YapayZeka;