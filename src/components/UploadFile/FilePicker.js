import React, { useState, useEffect } from 'react'
import {
    Modal,
    Button,
    Row,
    Col,
    Form,
    Select,
    Checkbox,
    Table,
    Input,
    Spin,
    notification,
    Upload,
    Divider,
    Popconfirm
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { BiTrash } from 'react-icons/bi'
import FileCard from 'components/files/FileCard';

export default function FilePicker({ files, showRemove, onChange }) {
    const [loading, setLoading] = useState(false)
    const [fileLists, setFileLists] = useState([])

    const Delete = async (index) => {
        const result = [...fileLists.slice(0, index), ...fileLists.slice(index + 1)]
        setFileLists(result)
        onChange(result)
    }

    return (
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
            <Col span={6}>
                <Upload
                    accept=".doc, .xlsx, .jpg, jpeg, .png, .zip, .pdf"
                    listType="picture"
                    fileList={[...fileLists]}
                    className="upload-list-inline"
                    onChange={async (info) => {
                        setLoading(true)
                        console.log(info.fileList)
                        let fileList = [...info.fileList];
                        // Accept 1 files only
                        fileList = fileList.slice(-5);
                        console.log(fileList)
                        setFileLists(info.fileList);
                        onChange(info.fileList)
                        fileList.forEach(function (file, index) {
                            let reader = new FileReader();
                            reader.onload = (e) => {
                                file.base64 = e.target.result;
                            };
                            reader.readAsDataURL(file.originFileObj);
                        });
                        // setUploadFile(await fileList);
                        setTimeout(() => setLoading(false), 2500)
                    }}

                    itemRender={(originNode, file, currFileList) => {
                    }}
                    multiple
                >
                    <Button type="primary" icon={<UploadOutlined />}>Upload</Button>
                </Upload>
            </Col>
            {fileLists?.map((file, index) => {
                console.log(file)
                return (
                    <Col style={{ position: 'relative' }}>
                        {showRemove && (<Popconfirm title='ลบไฟล์' okText='Yes' cancelText='No' onConfirm={() => Delete(index)}>
                            <Button
                                style={{
                                    color: "black",
                                    position: 'absolute',
                                    display: 'block',
                                    top: -10,
                                    right: -15,
                                    zIndex: 100,
                                }}
                                size='small'
                                shape="circle"
                                icon={<BiTrash color="black" />}
                            />
                        </Popconfirm>
                        )}
                        <div
                            style={{
                                padding: 3,
                                paddingLeft: 10,
                                paddingRight: 23,
                                border: "1px solid #DEDEDE",
                                borderRadius: 5
                            }}
                        >
                            <a
                                href={file.url || '#'}
                                download={file.name}
                            >
                                {file.name}
                            </a>
                        </div>
                    </Col>
                )
            })}
            {/* {fileLists?.map((file, index) => {
                console.log(file)
                const base64 = file?.base64?.split("base64,")[1] || null
                return (
                    <Col span={6} style={{ textAlign: 'center' }}>
                        <FileCard base64={base64} fileType={file.type} fileName={file.name} showRemove onDelete={(e) => setFileLists([...fileLists.slice(0, index), ...fileLists.slice(index + 1)])} />
                    </Col>
                )
            })} */}
        </Row>
    )
}