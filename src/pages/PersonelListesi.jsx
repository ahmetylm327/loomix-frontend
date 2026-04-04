import React, { useEffect, useState } from 'react';
import { Table, Tag, Card, Typography, message, Button, Modal, Form, Input, Select, InputNumber, Space, Popconfirm, Divider } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, WalletOutlined } from '@ant-design/icons';
import axiosInstance from '../api/axiosInstance';

const { Title } = Typography;

const PersonelListesi = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Ekleme/Düzenleme Modalı State'leri
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState(null);
    const [form] = Form.useForm();

    // Ödeme Modalı State'leri
    const [isPayModalVisible, setIsPayModalVisible] = useState(false);
    const [payEmployee, setPayEmployee] = useState(null);
    const [payAmount, setPayAmount] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/employees');
            setData(response.data);
        } catch (error) {
            message.error("Veriler çekilemedi!");
        } finally {
            setLoading(false);
        }
    };

    // --- MEVCUT EKLEME, GÜNCELLEME VE SİLME İŞLEMLERİ ---
    const handleSave = async (values) => {
        try {
            const backendData = {
                fullname: values.fullname,
                wage_type: values.wage_type === "Günlük" ? "Daily" : "Hourly",
                daily_wage: values.wage_amount,
                position: values.position,
                phoneNumber: values.phoneNumber,
                mikro_id: values.mikro_id || null
            };

            if (editingEmployee) {
                await axiosInstance.put(`/employees/${editingEmployee.employeeId}`, backendData);
                message.success("Personel güncellendi!");
            } else {
                await axiosInstance.post('/employees', backendData);
                message.success("Personel başarıyla eklendi!");
            }

            setIsModalVisible(false);
            setEditingEmployee(null);
            form.resetFields();
            fetchData();
        } catch (error) {
            message.error("İşlem başarısız!");
        }
    };

    const handleDelete = async (id) => {
        try {
            await axiosInstance.delete(`/employees/${id}`);
            message.success("Personel kaydı silindi.");
            fetchData();
        } catch (error) {
            message.error("Silme işlemi başarısız!");
        }
    };

    const showEditModal = (record) => {
        setEditingEmployee(record);
        form.setFieldsValue({
            fullname: record.fullname,
            position: record.position,
            wage_amount: record.daily_wage,
            wage_type: "Günlük",
            phoneNumber: record.phoneNumber
        });
        setIsModalVisible(true);
    };

    // --- YENİ: ÖDEME İŞLEMİ ---
    const handlePayment = async () => {
        if (!payAmount || payAmount <= 0) {
            return message.warning("Lütfen geçerli bir tutar girin.");
        }
        try {
            await axiosInstance.post(`/employees/${payEmployee.employeeId}/pay`, { miktar: payAmount });
            message.success(`${payEmployee.fullname} adlı personele ${payAmount} ₺ ödendi!`);
            setIsPayModalVisible(false);
            setPayAmount(0);
            fetchData(); // Tabloyu yenile ki bakiye düşsün
        } catch (error) {
            message.error("Ödeme yapılamadı!");
        }
    };

    const columns = [
        { title: 'Ad Soyad', dataIndex: 'fullname', key: 'fullname', render: t => <b>{t}</b> },
        { title: 'Pozisyon', dataIndex: 'position', key: 'position' },
        { title: 'Ücret', dataIndex: 'daily_wage', key: 'daily_wage', render: v => `${v} ₺` },
        { title: 'İçerideki Bakiye', dataIndex: 'balance', key: 'balance', render: v => <Tag color={v > 0 ? "error" : "success"}>{v || 0} ₺</Tag> },
        {
            title: 'İşlemler',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    {/* YENİ EKLENEN ÖDEME BUTONU */}
                    <Button
                        type="primary"
                        style={{ background: '#52c41a', borderColor: '#52c41a' }}
                        icon={<WalletOutlined />}
                        onClick={() => {
                            setPayEmployee(record);
                            setPayAmount(0);
                            setIsPayModalVisible(true);
                        }}
                    >
                        Ödeme Yap
                    </Button>

                    <Button icon={<EditOutlined />} onClick={() => showEditModal(record)}>Düzenle</Button>
                    <Popconfirm
                        title="Silmek istediğinize emin misiniz?"
                        onConfirm={() => handleDelete(record.employeeId)}
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
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <Title level={2}>Loomix Personel Yönetimi</Title>
                    <Button type="primary" icon={<PlusOutlined />} onClick={() => {
                        setEditingEmployee(null);
                        form.resetFields();
                        setIsModalVisible(true);
                    }}>
                        Yeni Personel Ekle
                    </Button>
                </div>

                <Table columns={columns} dataSource={data} rowKey="employeeId" loading={loading} scroll={{ x: 'max-content' }} pagination={{ pageSize: 10 }} bordered />
            </Card>

            {/* MEVCUT PERSONEL EKLEME MODALI */}
            <Modal
                title={editingEmployee ? "Personel Güncelle" : "Yeni Personel Kaydı"}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={() => form.submit()}
                okText="Kaydet"
            >
                <Form form={form} layout="vertical" onFinish={handleSave}>
                    <Form.Item name="fullname" label="Ad Soyad" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="position" label="Pozisyon" rules={[{ required: true }]}><Input /></Form.Item>
                    <Form.Item name="wage_type" label="Ücret Tipi" rules={[{ required: true }]}>
                        <Select>
                            <Select.Option value="Günlük">Günlük</Select.Option>
                            <Select.Option value="Saatlik">Saatlik</Select.Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="ucretMiktari" label="Ücret Miktarı" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
                    <Form.Item name="phoneNumber" label="Telefon"><Input /></Form.Item>
                </Form>
            </Modal>

            {/* YENİ: ÖDEME MODALI */}
            <Modal
                title={<><WalletOutlined style={{ color: '#52c41a' }} /> Avans / Maaş Ödemesi</>}
                open={isPayModalVisible}
                onCancel={() => setIsPayModalVisible(false)}
                onOk={handlePayment}
                okText="Ödemeyi Tamamla"
                okButtonProps={{ style: { background: '#52c41a', borderColor: '#52c41a' } }}
            >
                {payEmployee && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                        <Title level={4}>{payEmployee.fullname}</Title>
                        <p>İçerideki Toplam Alacağı: <b>{payEmployee.balance || 0} ₺</b></p>
                        <Divider />
                        <p>Ödenecek Tutar (₺):</p>
                        <InputNumber
                            style={{ width: '200px' }}
                            size="large"
                            min={0}
                            value={payAmount}
                            onChange={(value) => setPayAmount(value)}
                        />
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default PersonelListesi;