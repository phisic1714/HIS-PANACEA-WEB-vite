import React, { useState, useEffect, useRef } from "react";
import { UploadOutlined } from '@ant-design/icons';
import { Upload, Button } from 'antd'
import JSZip from "jszip";

export default function UploadToZip ({ base64, onChange=()=>{}, onUpload=()=>{} }) {
    const [fileLists, setFileLists] = useState([])
    const [filesFormUpload, setFileFormUpload] = useState([])
    const uploadRef = useRef()
    const filesHistoryDictionary = useRef({})

    const fileListToZip = async (files) => {
        const zipFile = new JSZip()
        files.forEach((item, index) => {
            const name = item.name
            const count = filesHistoryDictionary.current[name]

            if (count && fileLists?.length <= index){
                const fileName = name.split('.')
                zipFile.file(`${fileName[0]}(${count}).${fileName[1]}`, item.originFileObj);
                filesHistoryDictionary.current[name] = (filesHistoryDictionary[name] || 0) + 1
            }
            else{
                zipFile.file(`${name}`, item.originFileObj);
                if (fileLists?.length <= index){
                    filesHistoryDictionary.current[name] = 1
                }
            }
            console.log(filesHistoryDictionary.current)
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
            zipToBlobArray(base64)
        }
        else{
            setFileLists([])
        }
    }, [base64])

    return (
        <Upload
            ref={uploadRef}
            accept="*"
            fileList={[...filesFormUpload]}
            className="upload-list-inline"
            onChange={async (info) => {
                let fileList = [...info.fileList];
                console.log(fileList)
                // setFileLists(info.fileList);
                setFileFormUpload(fileList)
                onUpload('uploading')
                if (info.file.status !== 'uploading'){
                    const fileListPromise = fileList.map((file) => {
                        return new Promise((resolve) => {
                            let reader = new FileReader();
                            reader.onload = (e) => {
                                file.base64 = e.target.result;
                                resolve(file)
                            };
                            reader.readAsDataURL(file.originFileObj);
                            })
                    })
                    const fileListWithBase64 = await Promise.all(fileListPromise)
                    const newFileLists = [...fileLists, ...fileListWithBase64]
                    setFileLists(newFileLists);
                    const base64Zip = await fileListToZip(newFileLists)
                    onChange({
                        base64: base64Zip
                    })
                    setFileFormUpload([])
                    uploadRef.current.fileList = []
                    onUpload('succsess')
                }
            }}

            // eslint-disable-next-line no-unused-vars
            itemRender={(originNode, file, currFileList) => {
            }}
            multiple
        >
            <Button type="primary" icon={<UploadOutlined />}>Upload</Button>
        </Upload>
    )
}