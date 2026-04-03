import React, { useState } from "react";
import { Card, Typography, Form, Select, DatePicker, Button, Row, Col, Statistic, message, Divider, Table } from 'antd';
import { BarChartOutlined, LineChartOutlined, FileDoneOutlined, DollarCircleOutlined, CodeSandboxOutlined } from "@ant-design/icons";
import axiosInstance from '../api/axiosInstance';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const Raporlar = () => {
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [raporVerisi, setRaporVerisi] = useState(null);

    const handleRaporOlustur = async (values) => {
        setLoading(true);
        try {
            const startDate = values.tarihAraligi[0].format('YYYY-MM-DD');
            const endDate = values.tarihAraligi[1].format('YYYY-MM-DD');
            const reportType = values.raporTuru;

            const response = await axiosInstance.get('/reports', {
                params: { reportType, startDate, endDate }
            });

            setRaporVerisi(response.data);
            message.success("Rapor başarıyla oluşturuldu!");
        } catch (error) {
            message.error("Rapor oluşturulurken bir hata oluştu!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ padding: '30px' }}>
            <Card variant="borderless" style={{ marginBottom: 20, background: '#f0f2f5' }}>
                <Title level={2}><BarChartOutlined style={{ color: '#1890ff', marginRight: '10px' }} />Gelişmiş Raporlama Sistemi</Title>
                <p>Belirlediğiniz tarih aralığındaki finansal hareketleri ve üretim performansını analiz edin.</p>
                <Divider />

                {/*Rapor Filtreleme Formu */}
                <Form form={form} layout="inline" onFinish={handleRaporOlustur} initialValues={{ raporTuru: 'Genel' }}>
                    <Form.Item name="raporTuru" label="Rapor Türü" rules={[{ required: true }]}>
                        <Select style={{ width: 150 }}>
                            <Option value="Performans">Üretim Performansı</Option>
                            <Option value="Finans"> Kasa / Finans</Option>
                            <Option value="Genel">Genel (İkisi Birden)</Option>
                        </Select>
                    </Form.Item>

                    <Form.Item name="tarihAraligi" label="Tarih Aralığı" rules={[{ required: true, message: 'Lütfen bir tarih aralığı seçin!' }]}>
                        <RangePicker format="DD.MM.YYYY" style={{ width: 250 }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<LineChartOutlined />} loading={loading}>
                            Analiz Et ve Raporla</Button>
                    </Form.Item>
                </Form>
            </Card>

            {/*Rapor Sonuç Ekranı */}
            {raporVerisi && (
                <Card title={<span style={{ fontSize: '18px', fontWeight: 'bold' }}><FileDoneOutlined /> {raporVerisi.reportTitle}</span>} variant="borderless" style={{ borderTop: '4px solid #1890ff' }}>
                    <Row gutter={[24, 24]}>
                        {/* Finansal Veriler (Eğer varsa)*/}
                        {raporVerisi.financialData && (
                            <Col xs={24} md={12}>
                                <Card type="inner" title="Finansal Özet" styles={{ header: { background: '#e6f7ff' } }}>
                                    <Statistic title="Toplam Gelir" value={raporVerisi.financialData.totalIncome} precision={2} prefix={<DollarCircleOutlined />} suffix="₺" styles={{ content: { color: '#3f8600' } }} />
                                    <Statistic title="Toplam Gider" value={raporVerisi.financialData.totalExpenses} precision={2} prefix={<DollarCircleOutlined />} suffix="₺" styles={{ content: { color: '#cf1322' } }} style={{ marginTop: 16 }} />
                                    <Divider />
                                    <Statistic title="Net Kar / Zarar Bakiye" value={raporVerisi.financialData.netBalance} precision={2} suffix="₺" styles={{ content: { color: raporVerisi.financialData.netBalance >= 0 ? '#1890ff' : '#cf1322', fontWeight: 'bold' } }} />
                                </Card>
                            </Col>
                        )}

                        {/*Üretim Verileri (Eğer Varsa) */}
                        {raporVerisi.productionData && (
                            <Col xs={24} md={12}>
                                <Card type="inner" title="Üretim Performansı" styles={{ header: { background: '#f6ffed' } }}>
                                    <Statistic title="Toplam Ürtilen Ürün" value={raporVerisi.productionData.totalItemsProduced} prefix={<CodeSandboxOutlined />} suffix="Adet" styles={{ content: { color: '#096dd9' } }} />
                                    <Divider />
                                    <div>
                                        <p style={{ color: 'gray', marginBottom: 5 }}>En Çok Üretilen Model:</p>
                                        <h3 style={{ color: '#fa8c16', margin: 0 }}>{raporVerisi.productionData.mostProducedProduct}</h3>
                                    </div>
                                </Card>
                            </Col>
                        )}
                    </Row>
                </Card>
            )}
        </div>
    );
};

export default Raporlar;