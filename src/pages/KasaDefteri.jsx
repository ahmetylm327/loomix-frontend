import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, Button, Modal, Form, Select, InputNumber, DatePicker, Input, message, Tag, Row, Col, Statistic, Space, Popconfirm } from 'antd';
import { PlusOutlined, WalletOutlined, ArrowUpOutlined, ArrowDownOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const KasaDefteri = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingOdeme, setEditingOdeme] = useState(null);

    // Kasa Özet İstatistikleri İçin State
    const [stats, setStats] = useState({ toplamGelir: 0, toplamGider: 0, netBakiye: 0 });

    useEffect(() => {
        fetchData();
    }, []);

    const showEditModal = (record) => {
        setEditingOdeme(record);

        let formatiAyarliTarih = null;
        if (record.paymentDate) {
            formatiAyarliTarih = dayjs(record.paymentDate);
        }

        form.setFieldsValue({
            ...record,
            relatedId: record.relatedId?._id || record.relatedId,
            paymentDate: formatiAyarliTarih
        });

        setIsModalVisible(true);
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/payments/${id}`);
            message.success("Kasa işlemi silindi.");
            fetchData();
        } catch (error) {
            message.error("Silme işlemi başarısız!");
        }
    };


    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/payments');
            const islemler = response.data;
            setData(islemler);

            // Kasa istatistiklerini hesapla
            let gelir = 0;
            let gider = 0;
            islemler.forEach(islem => {
                if (islem.transactionType === 'Gelir') gelir += islem.amount;
                if (islem.transactionType === 'Gider') gider += islem.amount;
            });

            setStats({
                toplamGelir: gelir,
                toplamGider: gider,
                netBakiye: gelir - gider
            });

        } catch (error) {
            message.error("Kasa hareketleri çekilemedi!");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values) => {
        try {
            const garantiOdemeTipi = values.paymentType || values.odemeTipi || 'Nakit';
            const garantiKategori = values.category || values.kategori || 'Diğer';
            const garantiIslemYonu = values.transactionType || values.islemYonu || 'Gelir';
            const garantiTutar = values.amount || values.tutar || 0.01;
            const garantiTarih = values.paymentDate ? values.paymentDate.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
            const garantiNot = values.notes || values.notlar || "";

            const payload = {
                transactionType: garantiIslemYonu,
                islemYonu: garantiIslemYonu,

                paymentType: garantiOdemeTipi,
                odemeTipi: garantiOdemeTipi,

                amount: garantiTutar,
                tutar: garantiTutar,

                category: garantiKategori,
                kategori: garantiKategori,

                paymentDate: garantiTarih,
                odemeTarihi: garantiTarih,

                notes: garantiNot,
                notlar: garantiNot
            };

            if (editingOdeme) {
                // GÜNCELLEME MODU
                const id = editingOdeme.transactionId || editingOdeme._id;
                await axiosInstance.put(`/payments/${id}`, payload);
                message.success("İşlem başarıyla güncellendi!");
            } else {
                // YENİ EKLEME MODU
                await axiosInstance.post('/payments', payload);
                message.success("Yeni işlem kasaya işlendi!");
            }

            setIsModalVisible(false);
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error("Kayıt işlemi başarısız oldu!");
        }
    };

    const columns = [
        {
            title: 'Tarih',
            dataIndex: 'paymentDate',
            key: 'paymentDate',
            render: t => t ? new Date(t).toLocaleDateString('tr-TR') : '-'
        },
        {
            title: 'İşlem Yönü',
            dataIndex: 'transactionType',
            key: 'transactionType',
            render: tip => (
                <Tag color={tip === 'Gelir' ? 'success' : 'error'} icon={tip === 'Gelir' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}>
                    {tip === 'Gelir' ? 'TAHSİLAT (GELİR)' : 'ÖDEME (GİDER)'}
                </Tag>
            )
        },
        {
            title: 'Kategori',
            dataIndex: 'category',
            key: 'category',
            render: c => <b>{c}</b>
        },
        {
            title: 'Tutar',
            dataIndex: 'amount',
            key: 'amount',
            render: (tutar, record) => (
                <span style={{ color: record.transactionType === 'Gelir' ? '#52c41a' : '#f5222d', fontWeight: 'bold' }}>
                    {record.transactionType === 'Gelir' ? '+' : '-'}{tutar} ₺
                </span>
            )
        },
        {
            title: 'Ödeme Tipi',
            dataIndex: 'paymentType',
            key: 'paymentType'
        },
        {
            title: 'Notlar',
            dataIndex: 'notes',
            key: 'notes'
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>Düzenle</Button>
                    <Popconfirm
                        title="Bu kasa işlemini iptal etmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(record._id || record.transactionId)}
                        okText="Evet" cancelText="Hayır"
                    >
                        <Button danger icon={<DeleteOutlined />}>Sil</Button>
                    </Popconfirm>
                </Space>
            ),
        }
    ];

    return (
        <div style={{ padding: '30px' }}>
            {/* ÜST KISIM: KASA İSTATİSTİKLERİ */}
            <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                <Col xs={24} sm={8}>
                    <Card variant="borderless" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                        <Statistic title="Toplam Tahsilat (Gelir)" value={stats.toplamGelir} precision={2} style={{ content: { color: '#3f8600' } }} prefix={<ArrowUpOutlined />} suffix="₺" />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless" style={{ background: '#fff2f0', border: '1px solid #ffccc7' }}>
                        <Statistic title="Toplam Ödeme (Gider)" value={stats.toplamGider} precision={2} style={{ content: { color: '#cf1322' } }} prefix={<ArrowDownOutlined />} suffix="₺" />
                    </Card>
                </Col>
                <Col xs={24} sm={8}>
                    <Card variant="borderless" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                        <Statistic title="Güncel Kasa Bakiyesi" value={stats.netBakiye} precision={2} style={{ content: { color: '#096dd9' } }} prefix={<WalletOutlined />} suffix="₺" />
                    </Card>
                </Col>
            </Row>

            {/* ALT KISIM: TABLO */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Title level={2}><WalletOutlined style={{ color: '#1890ff', marginRight: '10px' }} /> Kasa Defteri</Title>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => {
                        setEditingOdeme(null);
                        form.resetFields();
                        setIsModalVisible(true);
                    }}>
                        Yeni Kasa Hareketi Ekle
                    </Button>
                </div>

                <Table columns={columns} dataSource={data} rowKey="transactionId" loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} bordered />
            </Card>

            <Modal title="Yeni Kasa İşlemi" open={isModalVisible} onCancel={() => setIsModalVisible(false)} onOk={() => form.submit()} okText="İşlemi Kaydet" cancelText="İptal">
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="transactionType" label="İşlem Yönü" rules={[{ required: true }]}>
                                <Select placeholder="Seçiniz">
                                    <Option value="Gelir">Tahsilat (Gelir)</Option>
                                    <Option value="Gider">Ödeme (Gider)</Option>
                                </Select>
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="amount" label="Tutar (₺)" rules={[{ required: true, message: 'Lütfen tutar girin!' }]}>
                                <InputNumber min={0.01} style={{ width: '100%' }} placeholder="Örn: 5000" />
                            </Form.Item>
                        </Col>
                    </Row>

                    {/* ÜST KISIM: KASA İSTATİSTİKLERİ */}
                    <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
                        <Col xs={24} sm={8}>
                            <Card variant="borderless" style={{ background: '#f6ffed', border: '1px solid #b7eb8f' }}>
                                {/* valueStyle yerine styles={{ content: {...} }} kullanıyoruz */}
                                <Statistic title="Toplam Tahsilat (Gelir)" value={stats.toplamGelir} precision={2} styles={{ content: { color: '#3f8600' } }} prefix={<ArrowUpOutlined />} suffix="₺" />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card variant="borderless" style={{ background: '#fff2f0', border: '1px solid #ffccc7' }}>
                                <Statistic title="Toplam Ödeme (Gider)" value={stats.toplamGider} precision={2} styles={{ content: { color: '#cf1322' } }} prefix={<ArrowDownOutlined />} suffix="₺" />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card variant="borderless" style={{ background: '#e6f7ff', border: '1px solid #91d5ff' }}>
                                <Statistic title="Güncel Kasa Bakiyesi" value={stats.netBakiye} precision={2} styles={{ content: { color: '#096dd9' } }} prefix={<WalletOutlined />} suffix="₺" />
                            </Card>
                        </Col>
                    </Row>

                    <Form.Item name="paymentDate" label="İşlem Tarihi (Boş bırakılırsa bugün sayılır)">
                        <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Tarih Seçiniz" />
                    </Form.Item>

                    <Form.Item name="notes" label="Açıklama / Notlar">
                        <Input.TextArea rows={2} placeholder="Fatura no, cari hesap detayı vb..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default KasaDefteri;