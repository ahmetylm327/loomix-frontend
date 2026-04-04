import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, message, Button, Modal, Form, Input, Select, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';

const { Title } = Typography;

const CariListesi = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingCari, setEditingCari] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/caris');
            setData(response.data);
        } catch (error) {
            message.error("Firmalar çekilemedi!");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (values) => {
        try {
            if (editingCari) {
                // Güncelleme İşlemi
                await axiosInstance.put(`/caris/${editingCari.cariId || editingCari._id}`, values);
                message.success("Firma başarıyla güncellendi!");
            } else {
                // Yeni Ekleme İşlemi
                await axiosInstance.post('/caris', values);
                message.success("Yeni firma eklendi!");
            }
            setIsModalVisible(false);
            setEditingCari(null);
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error("İşlem başarısız oldu!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/caris/${id}`);
            message.success("Firma kaydı silindi.");
            fetchData();
        } catch (error) {
            message.error("Silme işlemi başarısız!");
        }
    };

    const showEditModal = (record) => {
        setEditingCari(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const columns = [
        { title: 'Firma Adı', dataIndex: 'firmaAdi', key: 'firmaAdi', render: t => <b>{t}</b> },
        { title: 'Kategori', dataIndex: 'kategori', key: 'kategori' },
        { title: 'Vergi No', dataIndex: 'vergiNo', key: 'vergiNo' },
        { title: 'Telefon', dataIndex: 'telefon', key: 'telefon' },
        { title: 'Bakiye', dataIndex: 'bakiye', key: 'bakiye', render: v => `${v || 0} ₺` },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>Düzenle</Button>
                    <Popconfirm
                        title="Silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(record.cariId || record._id)}
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
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Title level={2}>Firma (Cari) Yönetimi</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        setEditingCari(null);
                        form.resetFields();
                        setIsModalVisible(true);
                    }}>
                        Yeni Firma Ekle
                    </Button>
                </div>
                <Table columns={columns} dataSource={data} rowKey={(record) => record.cariId || record._id} loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} bordered />
            </Card>

            <Modal
                title={editingCari ? "Firma Güncelle" : "Yeni Firma Kaydı"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText="Kaydet"
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="firmaAdi" label="Firma Adı" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="kategori" label="Kategori" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="Tedarikçi">Tedarikçi</Select.Option>
                            <Select.Option value="Müşteri">Müşteri</Select.Option>
                            <Select.Option value="Fason Takip">Fason Takip</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="vergiNo" label="Vergi No"><Input /></Form.Item>
                    <Form.Item name="telefon" label="Telefon"><Input /></Form.Item>
                    <Form.Item name="bakiye" label="Açılış Bakiyesi"><Input type="number" /></Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default CariListesi;