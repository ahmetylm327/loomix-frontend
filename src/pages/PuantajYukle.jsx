import React, { useState } from 'react';
import { Card, Typography, Upload, message, Divider, List, Tag } from 'antd';
import { InboxOutlined, FileExcelOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const PuantajYukle = () => {
    const [uploadedFiles, setUploadedFiles] = useState([]);

    const uploadProps = {
        name: 'file', // Backend'e gidecek dosyanın parametre adı (req.file)
        multiple: false,
        action: 'https://loomix-xlp4.onrender.com/puantaj/yukle', // Backend rotamız burası olacak
        accept: '.xlsx, .xls', // Sadece Excel dosyalarına izin ver
        onChange(info) {
            const { status } = info.file;
            if (status === 'done') {
                message.success(`${info.file.name} başarıyla sisteme yüklendi ve işlendi.`);
                setUploadedFiles(prev => [...prev, info.file.name]);
            } else if (status === 'error') {
                message.error(`${info.file.name} yüklenirken bir hata oluştu.`);
            }
        },
        onDrop(e) {
            console.log('Sürüklenen dosya:', e.dataTransfer.files);
        },
    };

    return (
        <Card>
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
                <Title level={2}><FileExcelOutlined style={{ color: '#52c41a' }} /> Excel Puantaj Yükleme</Title>
                <Text type="secondary">
                    Personellerin çalışma saatlerini ve hakedişlerini otomatik hesaplamak için
                    Mikro yazılımından aldığınız Excel (.xlsx) dosyasını aşağıya sürükleyin.
                </Text>
            </div>

            <Divider />

            <div style={{ padding: '20px 50px' }}>
                <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined style={{ color: '#1890ff' }} />
                    </p>
                    <p className="ant-upload-text">Dosyayı seçmek için tıklayın veya bu alana sürükleyin</p>
                    <p className="ant-upload-hint">
                        Sistemin doğru hesaplama yapabilmesi için dosyanın standart puantaj formatında olmasına dikkat ediniz.
                    </p>
                </Dragger>
            </div>

            {uploadedFiles.length > 0 && (
                <div style={{ marginTop: 40 }}>
                    <Title level={4}>Son Yüklenen Puantajlar</Title>
                    <List
                        bordered
                        dataSource={uploadedFiles}
                        renderItem={item => (
                            <List.Item>
                                <Typography.Text mark>[EXCEL]</Typography.Text> {item}
                                <Tag color="success" icon={<CheckCircleOutlined />} style={{ float: 'right' }}>
                                    İşlendi
                                </Tag>
                            </List.Item>
                        )}
                    />
                </div>
            )}
        </Card>
    );
};

export default PuantajYukle;