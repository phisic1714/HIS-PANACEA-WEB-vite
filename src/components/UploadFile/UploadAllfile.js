import React, { useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { Button, Row, Col } from "antd";
import { UploadOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons'
import { MIMETypes } from 'components/helper/golobalVar/MIMETypes';
const UploadAllfile = forwardRef(function UploadAllfile({
    onChange = () => { },
    flexDirection = "",
    hiddenUploadButton = false,
    span = 8,
    deletable = true
}, ref) {
    const userFromSession = JSON.parse(sessionStorage.getItem("user"));
    const user = userFromSession.responseData.userId;

    const hiddenPictureUploadInput = useRef(null);
    const [fileList, setFileList] = useState([]);

    useImperativeHandle(ref, () => ({
        setFileList: (data) => setFileList(data),
        getFileList: () => fileList
    }));
    const handleClick = event => {
        const { target = {} } = event || {};
        target.value = "";
    };
    const handlePictureUploadClick = () => {
        hiddenPictureUploadInput.current.click();
    };
    const handlePictureUploadChange = async (event) => {
        const filesUploaded = event.target.files;
        const newFiles = [];
        for (let i = 0; i < filesUploaded.length; i++) {
            const file = filesUploaded[i];
            const base64 = await convertBase64(file);
            // console.log('base64', base64)
            newFiles.push({
                base64: base64,
                fileName: file.name,
                userCreated: user,
                userModified: user
            });
        }
        setFileList([...fileList, ...newFiles]);
        onChange([...fileList, ...newFiles])
    };
    const handleRemoveFile = (e, index) => {
        e.stopPropagation();
        setFileList(prevList => prevList.filter((_, i) => i !== index));
    };
    const convertBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const fileReader = new FileReader();
            fileReader.readAsDataURL(file);
            fileReader.onload = () => {
                const base64String = fileReader.result;
                const strippedBase64 = stripBase64Header(base64String);
                resolve(strippedBase64);
            };
            fileReader.onerror = (error) => {
                reject(error);
            };
        });
    };
    const stripBase64Header = (base64String) => {
        // ตรวจสอบว่า base64String มี header ที่ต้องลบหรือไม่
        // console.log('base64String', base64String)
        const headerRegex = /^data:(.*);base64,/;
        const matches = base64String.match(headerRegex);

        if (matches && matches.length > 1) {
            // console.log('matches=>')
            // เช็คว่า header เป็นไฟล์รูปภาพหรือไฟล์เอกสารหรือไม่
            const headerType = matches[1];
            if (headerType.startsWith('image/') || headerType.startsWith('application/') || headerType.startsWith('text/')) {
                // ลบ header สำหรับไฟล์รูปภาพหรือไฟล์เอกสารทุกประเภท
                return base64String.replace(headerRegex, '');
            }
        }

        // หรือคืนค่า base64String เดิมหากไม่ตรงเงื่อนไข
        return base64String;
    };
    const handleDownloadFile = (file) => {
        const correctType = (base64, name) => {
            let type = name.split(".").pop()
            return `data:${MIMETypes[type]};base64,${base64}`
        }
        const a = document.createElement('a');
        a.href = correctType(file.base64, file.fileName);
        a.download = file.fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };
    return (
        <>
            <Button
                type='primary'
                hidden={hiddenUploadButton}
                onClick={handlePictureUploadClick}
                style={{ marginBottom: 4 }}
                icon={<UploadOutlined />}
            >

                เพิ่มไฟล์
            </Button>
            <input
                type="file"
                accept=".doc, .xlsx, .jpg, .jpeg, .png, .zip, .pdf, .txt"
                ref={hiddenPictureUploadInput}
                onChange={handlePictureUploadChange}
                onClick={handleClick}
                hidden
                multiple // เพิ่มตรงนี้
            />
            <Row gutter={[8, 8]} style={{ flexDirection: flexDirection }} >
                {fileList.map((item, index) => (
                    <Col span={span} key={String(index)}>
                        <div style={{ border: "1px solid #ccc", borderRadius: 3, padding: 2 }}>
                            <Row gutter={[4, 4]} style={{ flexDirection: "row" }}>
                                <Col span={14}>
                                    <label className='data-value'>
                                        {item.fileName} {/* แสดงชื่อไฟล์ */}
                                    </label>
                                </Col>
                                <Col span={5} className='text-center'>
                                    <Button
                                        size='small'
                                        type="primary"
                                        style={{ margin: 0 }}
                                        icon={<DownloadOutlined />}
                                        onClick={() => handleDownloadFile(item)}
                                    />
                                </Col>
                                <Col span={5} className='text-center'>
                                    <Button
                                        size='small'
                                        type="default"
                                        style={{ margin: 0 }}
                                        icon={<DeleteOutlined className='text-danger' />}
                                        onClick={(e) => handleRemoveFile(e, index)}
                                        disabled={!deletable}
                                    />
                                </Col>
                            </Row>
                        </div>
                    </Col>
                ))}
            </Row>
        </>
    );
});

export default UploadAllfile;
