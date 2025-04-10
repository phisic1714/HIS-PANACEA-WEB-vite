import React, { useState, useEffect } from "react";
import { BiTrash } from 'react-icons/bi'
import JSZip from "jszip";
import { Row, Col, Button, Popconfirm, Spin } from 'antd'

export default function ZipFilesShow ({ base64, loading, showRemove, onChange=()=>{} }) {
    const [mainLoading, setLoading] = useState(false)
    const [fileLists, setFileLists] = useState([])
    const Delete = async (index) => {
        const result = [...fileLists.slice(0, index), ...fileLists.slice(index + 1)]
        setFileLists(result)
        let convertBase64 = null
        if (result.length > 0){
            convertBase64 = await fileListToZip(result)
        }
        onChange({
            base64: convertBase64
        })
    }

    const fileListToZip = async (files) => {
        const zipFile = new JSZip()
        files.forEach((item) => {
            zipFile.file(item.name, item.originFileObj);
        });
        const result = await zipFile.generateAsync({
            type: "base64"
        })
        return result
    }

    const zipToBlobArray = async (data) => {
        const filesInZip = await JSZip.loadAsync(data, { base64: true }).then(function (zip) {
            var promises = Object.keys(zip.files).map(function (fileName) {
                var file = zip.files[fileName];
                return file.async("blob").then(function (blob) {
                    return [
                        fileName,
                        blob,
                    ];
                });
            });
            return Promise.all(promises);
            }).then(function (result) {
                return result.map((item) => {
                    return {
                        name: item[0],
                        url: window.URL.createObjectURL(item[1])
                    }
                })
            }).catch(function (e) {
                console.error(e);
        });
        setFileLists(filesInZip)
        return filesInZip
    }

    useEffect(() => {
        if (base64){
            setLoading(true)
            zipToBlobArray(base64).then(() => setLoading(false))
        }
        else{
            setFileLists([])
        }
    }, [base64])

    

    return (
        <Spin spinning={mainLoading || loading}>
            <Row style={{ flexDirection: 'row' }} gutter={[16, 16]}>
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
                                    icon={<BiTrash color="black"/>} 
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
            </Row>
        </Spin>
    )
}