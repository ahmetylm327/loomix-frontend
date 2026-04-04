import React, { useEffect, useState } from "react";
import { Table, Card, Typography, Button, Modal, Form, Select, InputNumber, DatePicker, Input, message, Tag, Space, Popconfirm, Tooltip } from 'antd';
import { PlusOutlined, AppstoreOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import axiosInstance from '../api/axiosInstance';
import dayjs from 'dayjs';

const { Title } = Typography;
const { Option } = Select;

const UretimListesi = () => {
    const [data, setData] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();
    const [editingUretim, setEditingUretim] = useState(null);


    useEffect(() => {
        fetchData();
        fetchProducts();

    }, []);
    const showEditModal = (record) => {
        setEditingUretim(record);

        let formatiAyarliTarih = null;
        if (record.productionDate) {
            formatiAyarliTarih = dayjs(record.productionDate);
        }

        form.setFieldsValue({
            ...record,
            productId: record.productId?._id || record.productId,
            productionDate: formatiAyarliTarih // <-- 
        });

        setIsModalVisible(true);
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/production');
            setData(response.data);
        } catch (error) {
            message.error("Üretim verileri çekilemedi!");
        } finally {
            setLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await axiosInstance.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error("Ürünler çekilemedi: ", error);
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/production/${id}`);
            message.success("Üretim kaydı silindi.");
            fetchData();
        } catch (error) {
            message.error("Silme işlemi başarısız!");
        }
    };


    const handleSave = async (values) => {
        try {
            let formattedDate = '';
            let extraNote = '';

            if (values.entryType === 'Haftalık' && Array.isArray(values.productionDate)) {
                formattedDate = values.productionDate[0].format('YYYY-MM-DD');
                extraNote = `[${values.productionDate[0].format('DD.MM.YYYY')} - ${values.productionDate[1].format('DD.MM.YYYY')} Arası] `;
            } else {

                formattedDate = typeof values.productionDate === 'string'
                    ? values.productionDate
                    : values.productionDate.format('YYYY-MM-DD');
            }

            const payload = {
                productId: values.productId,
                quantity: values.quantity,
                entryType: values.entryType,
                productionDate: formattedDate,
                notes: extraNote + (values.notes || "")
            };

            if (editingUretim) {

                const id = editingUretim.productionId || editingUretim._id;
                await axiosInstance.put(`/production/${id}`, payload);
                message.success("Üretim verisi başarıyla güncellendi!");
            } else {
                await axiosInstance.post('/production', payload);
                message.success("Üretim verisi başarıyla kaydedildi!");
            }

            setIsModalVisible(false);
            setEditingUretim(null); // Düzenleme modundan çık
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error("Kayıt işlemi başarısız oldu!");
            console.error("Hata detayı:", error);
        }
    };

    const columns = [
        {
            title: 'Üretim Tarihi',
            dataIndex: 'productionDate',
            key: 'productionDate',
            render: t => t ? new Date(t).toLocaleDateString('tr-TR') : '-'
        },
        {
            title: 'Ürün Adı',
            key: 'productName',
            render: (_, record) => {
                const urun = record.productId;
                if (urun && typeof urun === 'object') {
                    // Veritabanında adı ne kayıtlıysa onu yakalar
                    return <b>{urun.product_name || urun.urunAdi || urun.name || urun.title || "İsim Yok"}</b>;
                }
                return <b>Silinmiş Ürün</b>;
            }
        },
        {
            title: 'Kategori',
            key: 'category',
            render: (_, record) => {
                const urun = record.productId;
                if (urun && typeof urun === 'object') {
                    return <Tag color="blue">{urun.category || urun.kategori || "Belirtilmemiş"}</Tag>;
                }
                return <Tag color="default">-</Tag>;
            }
        },
        {
            title: 'Üretim Adedi',
            dataIndex: 'quantity',
            key: 'quantity',
            render: q => q ? <Tag color="green" style={{ fontSize: '14px', padding: '4px 8px' }}>{q} Adet</Tag> : '-'
        },
        {
            title: 'Kayıt Tipi',
            dataIndex: 'entryType',
            key: 'entryType',
            render: t => t || '-'
        },
        {
            title: 'Notlar',
            dataIndex: 'notes',
            key: 'notes',
            width: 100,
            ellipsis: {
                showTitle: false, // Varsayılan tarayıcı başlığını kapatıyoruz
            },
            render: (text) => (
                <Tooltip placement="topLeft" title={text}>
                    {text}
                </Tooltip>
            ),
        },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>
                        Düzenle
                    </Button>
                    <Popconfirm
                        title="Bu üretimi silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(record._id || record.productionId)}
                        okText="Evet"
                        cancelText="Hayır"
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
                <div style={{
                    display: 'flex', justifyContent: 'space-between', marginBottom: 20, width: '100%'
                }}>
                    <Title level={2}><AppstoreOutlined style={{ color: '#1890ff', marginRight: '10px' }} /> Üretim Takibi</Title>
                    <Button type="primary" icon={<PlusOutlined />} size="large" onClick={() => {
                        setEditingUretim(null);
                        form.resetFields();
                        setIsModalVisible(true)
                    }}>
                        Yeni Üretim Girişi
                    </Button>
                </div>
                <div style={{ width: '100%', overflowX: 'auto' }}>
                    <Table columns={columns} dataSource={data} rowKey="_id" loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 2 }} bordered />
                </div>
            </Card >

            <Modal
                title="Yeni Üretim Kaydı"
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText="Kaydet"
                cancelText="İptal"
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="productId" label="Üretilen Model (Ürün)" rules={[{ required: true, message: 'Lütfen bir ürün seçin!' }]}>
                        <Select showSearch placeholder="Ürün Seçiniz" optionFilterProp="children">
                            {products.map(p => (
                                <Option key={p._id || p.productId} value={p._id || p.productId}>
                                    {/* Tablodaki gibi tüm olası isimleri arıyoruz */}
                                    {p.product_name || p.urunAdi || p.name || p.title || "İsimsiz Ürün"}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="quantity" label="Üretim Adedi" rules={[{ required: true, message: 'Lütfen adet girin!' }]}>
                        <InputNumber min={1} style={{ width: '100%' }} placeholder="Örn: 1250" />
                    </Form.Item>

                    <Form.Item name="entryType" label="Kayıt Tipi" rules={[{ required: true }]}>
                        <Select placeholder="Seçiniz">
                            <Option value="Günlük">Günlük</Option>
                            <Option value="Haftalık">Haftalık</Option>
                        </Select>
                    </Form.Item>
                    {/* SEÇİLENE GÖRE DİNAMİK DEĞİŞEN TARİH KUTUSU */}
                    <Form.Item noStyle shouldUpdate={(prev, current) => prev.entryType !== current.entryType}>
                        {({ getFieldValue }) => {
                            const tip = getFieldValue('entryType');
                            return (
                                <Form.Item
                                    name="productionDate"
                                    label={tip === 'Haftalık' ? 'Üretim Haftası (Aralık Seçin)' : 'Üretim Tarihi'}
                                    rules={[{ required: true, message: 'Lütfen tarih belirleyin!' }]}
                                >
                                    {tip === 'Haftalık' ? (
                                        <DatePicker.RangePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder={['Başlangıç', 'Bitiş']} />
                                    ) : (
                                        <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Tarih Seçiniz" />
                                    )}
                                </Form.Item>
                            );
                        }}
                    </Form.Item>

                    <Form.Item name="productionDate" label="Üretim Tarihi" rules={[{ required: true, message: 'Tarih seçimi zorunludur!' }]}>
                        <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" placeholder="Tarih Seçiniz" />
                    </Form.Item>

                    <Form.Item name="notes" label="Notlar (Opsiyonel)">
                        <Input.TextArea rows={2} placeholder="Vardiya, parti no vb. notlar..." />
                    </Form.Item>
                </Form>
            </Modal>
        </div >
    );
};

export default UretimListesi;
