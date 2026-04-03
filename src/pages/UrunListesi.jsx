import React, { useEffect, useState } from 'react';
import { Table, Card, Typography, message, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';

const { Title } = Typography;

const UrunListesi = () => {
    const [data, setData] = useState([]);
    const [cariler, setCariler] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUrun, setEditingUrun] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        fetchData();
        fetchCariler();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/products');
            setData(response.data);
        } catch (error) {
            message.error("Ürünler çekilemedi!");
        } finally {
            setLoading(false);
        }
    };

    // Formda "Ait Olduğu Firma" seçebilmek için carileri çekiyoruz
    const fetchCariler = async () => {
        try {
            const response = await axiosInstance.get('/caris');
            setCariler(response.data);
        } catch (error) {
            console.log("Cariler çekilemedi");
        }
    };

    const handleSave = async (values) => {
        try {
            if (editingUrun) {
                await axiosInstance.put(`/products/${editingUrun.productId || editingUrun._id}`, values);
                message.success("Ürün başarıyla güncellendi!");
            } else {
                await axiosInstance.post('/products', values);
                message.success("Yeni ürün eklendi!");
            }
            setIsModalVisible(false);
            setEditingUrun(null);
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error("İşlem başarısız oldu!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/products/${id}`);
            message.success("Ürün silindi.");
            fetchData();
        } catch (error) {
            message.error("Silme işlemi başarısız!");
        }
    };

    const showEditModal = (record) => {
        setEditingUrun(record);
        form.setFieldsValue(record);
        setIsModalVisible(true);
    };

    const columns = [
        { title: 'Ürün Adı', dataIndex: 'urunAdi', key: 'urunAdi', render: t => <b>{t}</b> },
        { title: 'Kategori', dataIndex: 'kategori', key: 'kategori' },
        { title: 'Dikim Bedeli (₺)', dataIndex: 'birimFiyat', key: 'birimFiyat', render: v => `${v || 0} ₺` },
        {
            title: 'Ait Olduğu Firma',
            dataIndex: 'cariId',
            key: 'cariId',
            // O karmaşık ID'yi alıp, cariler listesinden firmanın gerçek adını buluyoruz!
            render: (id) => {
                const cari = cariler.find(c => c._id === id || c.cariId === id);
                return cari ? cari.firmaAdi : "Bilinmiyor";
            }
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>Düzenle</Button>
                    <Popconfirm
                        title="Bu ürünü silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(record.productId || record._id)}
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
                    <Title level={2}>Ürün / Model Tanımları</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        setEditingUrun(null);
                        form.resetFields();
                        setIsModalVisible(true);
                    }}>
                        Yeni Model Ekle
                    </Button>
                </div>
                <Table columns={columns} dataSource={data} rowKey={(record) => record.productId || record._id} loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} bordered />
            </Card>

            <Modal
                title={editingUrun ? "Model Güncelle" : "Yeni Model Tanımla"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText="Kaydet"
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="urunAdi" label="Ürün Adı" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="kategori" label="Kategori" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="Üst Giyim">Üst Giyim</Select.Option>
                            <Select.Option value="Alt Giyim">Alt Giyim</Select.Option>
                            <Select.Option value="Aksesuar">Aksesuar</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="birimFiyat" label="Dikim Bedeli (₺)" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="cariId" label="Ait Olduğu Firma" rules={[{ required: true }]}>
                        <Select placeholder="Firma Seçin">
                            {cariler.map(cari => (
                                <Select.Option key={cari.cariId || cari._id} value={cari.cariId || cari._id}>
                                    {cari.firmaAdi}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default UrunListesi;