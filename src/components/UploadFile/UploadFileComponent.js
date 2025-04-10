import { Button, message, Modal, Table, Upload } from "antd"
import { useEffect, useState } from "react"
import { PlusOutlined } from '@ant-design/icons';
import { LabelTopicPrimary, LabelTopicPrimary18 } from "components/helper/function/GenLabel";
import { DeleteOutlined } from '@ant-design/icons';

const allowedFileTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff',
    'application/pdf', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv'
];

const extensionToMimeTypeMap = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.bmp': 'image/bmp',
    '.webp': 'image/webp',
    '.tiff': 'image/tiff',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.csv': 'text/csv'
};

const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

export default function UploadFileComponent({
    fileList = [],
    handleUploadFile = () => { },
    readOnly = false,
    ...props
}) {
    const [isVisiblePreview, setIsVisiblePreview] = useState(false)
    const [previewImg, setPreviewImg] = useState("")
    const [fileImage, setFileImage] = useState([])
    const [fileOther, setFileOther] = useState([])

    const handlePreview = async file => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj);
        } else {
            file.preview = file.url
        }
        setPreviewImg(file.preview)
        setIsVisiblePreview(true)
    };

    const beforeUpload = (file) => {
        const isAllowed = allowedFileTypes.includes(file.type);

        if (!isAllowed) {
            message.error(`${file.name} is not a valid file type`);
        }

        return isAllowed || Upload.LIST_IGNORE;
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div
                style={{
                    marginTop: 8,
                }}
            >
                Upload
            </div>
        </div>
    );

    useEffect(() => {
        setFileImage([])
        setFileOther([])

        if (fileList.length > 0) {
            console.log('fileList', fileList)
            const filterFileList = fileList.filter((v) => {
                const mimeType = extensionToMimeTypeMap[v.fileType]
                if (mimeType?.includes("image")) return true
                if (!v?.userCreated) return true

                setFileOther((p) => ([...p, v]))
                return false
            })
            setFileImage(filterFileList)
        }

    }, [fileList])

    return <>
        <Upload
            listType="picture-card"
            fileList={fileImage}
            onPreview={handlePreview}
            onChange={(v) => {
                const { fileList } = v
                handleUploadFile([...fileOther, ...fileList])
            }}
            beforeUpload={beforeUpload}
            disabled={readOnly}
        >
            {uploadButton}
        </Upload>
        <LabelTopicPrimary text='ไฟล์เอกสาร' style={{ paddingTop: "10px" }} />
        <Table dataSource={fileOther} columns={[
            {
                title: 'ลำดับ',
                dataIndex: 'index',
                render: (text, record, index) => index + 1
            },
            {
                title: 'ชื่อไฟล์',
                dataIndex: 'fileName',
                render: (text, record) => (
                    <a
                        onClick={() => {
                            const { fileName = 'download', fileType, picture } = record

                            if (!picture || !fileType) return message.error("ไม่สามาถ download ไฟล์");

                            const byteCharacters = atob(picture);
                            const byteNumbers = new Array(byteCharacters.length);

                            for (let i = 0; i < byteCharacters.length; i++) {
                                byteNumbers[i] = byteCharacters.charCodeAt(i);
                            }

                            const byteArray = new Uint8Array(byteNumbers);
                            const blob = new Blob([byteArray], { type: extensionToMimeTypeMap[fileType] });
                            const link = document.createElement('a');

                            link.href = window.URL.createObjectURL(blob);
                            link.download = `${fileName}${fileType}`;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                        }}
                        style={{ textDecoration: 'underline', cursor: 'pointer', color: "blue" }}
                    >
                        {text}
                    </a>
                )
            },
            {
                title: "ประเภทเอกสาร",
                dataIndex: 'fileType',
            },
            {
                title: 'จัดการ',
                dataIndex: '',
                render: (text, record) => (
                    <Button
                        type="text"
                        icon={<DeleteOutlined />}
                        disabled={readOnly}
                        onClick={() => {
                            const listFile = fileList.filter((v) => v.labPicId !== record.labPicId)
                            handleUploadFile(listFile)
                        }}
                    >
                    </Button>
                )
            },
        ]} />
        <Modal
            centered
            visible={isVisiblePreview}
            footer={null}
            onCancel={() => { setIsVisiblePreview(false) }}
        >
            <img alt="example" style={{ width: '100%' }} src={previewImg} />
        </Modal>
    </>
}