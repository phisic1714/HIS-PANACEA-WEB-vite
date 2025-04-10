import React, { useState, useEffect, useMemo, useRef } from "react";
import { env } from '../env.js';
import { Upload, Button, Row, Col, Card, Space, Image, Modal } from 'antd'
import { BiTrash } from 'react-icons/bi'
import { Icon } from "@iconify/react";
import { useParams } from "react-router-dom";
import Scrollbars from "react-custom-scrollbars";
import getBrowserType from "components/helper/function/GetBrowserType";
import useSignalrHub from "libs/useSignalrHub";
import axios from "axios";
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { toast, ToastContainer } from "react-toastify";

const { confirm } = Modal;

export default function MobileUpload() {
    const [loading, setLoading] = useState(false)
    const [fileLists, setFileLists] = useState([])
    const [connectStatus, setConnectStatus] = useState(null)
    const [uploadRound, setUploadRound] = useState(1)
    const imagesTemp = useRef([])

    const { id } = useParams()
    const searchParams = new URLSearchParams(location.search);
    const querytokenCode = searchParams.get("token");

    const uploadHub = useSignalrHub('/UploadPic', querytokenCode)

    const browserType = useMemo(() => getBrowserType(), [])

    const urlToBlob = async imageUrl => {
        console.log('imageUrl', imageUrl)
        const resBlob = await axios.get(imageUrl, {
            responseType: 'blob',
        }).then(response => {
            return response.data;
        }).catch(error => {
            console.error('There was a problem with the Axios request:', error);
            return null;
        });
        return resBlob
    };

    const upload = async () => {
        setLoading(true)
        const formUploadList = await Promise.all(fileLists.map((item) => {
            return urlToBlob(item?.base64)
        }))

        const formData = new FormData();
        formUploadList.forEach((obj, index) => {
            formData.append(`${id}_${uploadRound}_${index + 1}.jpg`, obj, `${id}_${uploadRound}_${index + 1}.jpg`);
        })

        const res = await axios.post(`${env.REACT_APP_PANACEACHS_SERVER}/api/UploadPicSignalR/UploadFile?guid=${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${querytokenCode}`
            },

        })
        if (res.status === 200) {
            toast.success("บันทึกสำเร็จ", {
                position: "top-right",
                autoClose: 1500,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
            setFileLists([])
            setUploadRound(uploadRound + 1)
            imagesTemp.current = []
        }
        else {
            toast.warning("บันทึกไม่สำเร็จ", {
                position: "top-right",
                autoClose: 1500,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true
            });
        }
        setLoading(false)
    }

    const checkSession = async () => {
        // joinQrUploadHub()
        // const result = await new Promise((resolve, reject) => {
        //     uploadHub.on('userSessionAll', (userSessionAll) => {
        //         console.log(userSessionAll)
        //         if (userSessionAll?.length > 1) {
        //             setConnectStatus('success')
        //             resolve(userSessionAll)
        //         }
        //         else {
        //             setConnectStatus('failed')
        //             reject(userSessionAll)
        //         }
        //     })
        // })
        // return result
    }

    const send = async () => {
        confirm({
            icon: <ExclamationCircleOutlined />,
            content: "ยืนยันการส่งรูปภาพทั้งหมด",
            onOk() {
                upload()
            },
            onCancel() {
            }
        })
    }

    const joinQrUploadHub = async () => {
        const cleanId = id.split("?")[0];

        if (uploadHub.connection?.connectionState === 'Disconnected') {
            await uploadHub.start()

            uploadHub.on('UploadMultiPic', (user, message) => {
                console.log(user, message)
            })

            uploadHub.on('userSessionAll', (userSessionAll) => {
                if (userSessionAll?.length > 1) {
                    setConnectStatus('success')
                } else {
                    setConnectStatus('failed')
                }
            })

            await uploadHub.joinGroup('JoinGroup', {
                urlGroup: cleanId,
            })
        }
    }

    useEffect(() => {
        if (uploadHub && id) {
            joinQrUploadHub()
        }
    }, [uploadHub, id])

    return connectStatus === 'success' ? (
        <div>
            <div style={{ position: 'fixed', width: '100%', textAlign: 'center', height: "5%" }}>
                <h1>Upload Files</h1>
            </div>
            <div style={{ position: 'fixed', width: '100%', top: '5vh', height: "65%" }}>
                <Scrollbars autoHeight autoHeightMin={"65vh"}>
                    <Row gutter={[6, 2]}>
                        {fileLists?.map((item, index) => {
                            return (
                                <Col span={12}>
                                    <Card loading={item.loading} style={{ position: 'relative' }}>
                                        <Button
                                            style={{
                                                backgroundColor: "red",
                                                color: "white",
                                                position: 'absolute',
                                                display: 'block',
                                                top: 0,
                                                right: 0,
                                                zIndex: 100
                                            }}
                                            danger
                                            shape="circle"
                                            icon={<BiTrash color="white" />}
                                            size={5}
                                            onClick={(e) => {
                                                setFileLists((prev) => {
                                                    const result = [...prev.slice(0, index), ...prev.slice(index + 1)]
                                                    imagesTemp.current = result
                                                    return result
                                                })
                                            }}
                                        />
                                        <div style={{ width: "100%", textAlign: 'center' }}>
                                            <Image
                                                src={item?.base64}
                                                style={{ width: "100%", height: "25vh", objectFit: 'cover' }}
                                            />
                                            {/* <span>{item?.name}</span> */}
                                        </div>
                                    </Card>
                                </Col>
                            )
                        })}
                    </Row>
                </Scrollbars>
            </div>
            <div style={{ position: 'fixed', width: '100%', top: browserType === 'Apple Safari' ? '65vh' : '70vh', height: "30%" }}>
                <Card bodyStyle={{ height: "100%" }} style={{ height: "100%" }}>
                    <Row style={{ height: "100%" }} gutter={[6, 6]}>
                        <Col span={24} style={{ height: "40%" }}>
                            <Upload.Dragger
                                style={{ width: "100%" }}
                                accept=".jpg, jpeg, .png"
                                listType="picture"
                                fileList={[...fileLists]}
                                className="upload-list-inline"
                                beforeUpload={(file,) => {
                                    console.log(file);
                                    const isLt2M = file.size / 1024 / 1024 < 2;
                                    if (!isLt2M) {
                                        toast.error("Image must smaller than 2MB!");
                                        return Upload.LIST_IGNORE;
                                    } else {
                                        return false;
                                    }
                                    // Prevent antd Upload from uploading the file automatically
                                }}
                                // action={`${env.REACT_APP_PANACEACHS_SERVER}/api/UploadPicSignalR/UploadFile?guid=${id}`}
                                onChange={async (info) => {
                                    let fileList = [...info.fileList];
                                    let isConvert = false
                                    console.log(imagesTemp.current)
                                    imagesTemp.current = fileList?.map((item, index) => {
                                        const imageTemp = imagesTemp.current[index]
                                        if (imageTemp) {
                                            return imageTemp
                                        }
                                        else {
                                            isConvert = true
                                            return {
                                                ...item, loading: true
                                            }
                                        }
                                    })
                                    if (isConvert) {
                                        setFileLists(imagesTemp.current);
                                        const resultBase64 = await Promise.all(imagesTemp.current.map((file, index) => {
                                            return new Promise((resolve, reject) => {
                                                if (file.loading) {
                                                    let reader = new FileReader();
                                                    reader.onload = (e) => {
                                                        const base64 = e.target.result;
                                                        const result = {
                                                            ...file,
                                                            base64,
                                                            loading: false
                                                        }
                                                        imagesTemp.current[index] = result
                                                        console.log(imagesTemp.current)
                                                        setFileLists(imagesTemp.current)
                                                        resolve(result)
                                                    };
                                                    reader.readAsDataURL(file.originFileObj);
                                                }
                                                resolve(file)
                                            })
                                        }))
                                        console.log(resultBase64)
                                        setFileLists(resultBase64)
                                    }
                                }}
                                itemRender={(originNode, file, currFileList) => {
                                }}
                                multiple
                            >
                                <div style={{ width: "100%", fontSize: 20 }}>
                                    <Space size={20}>
                                        <Icon icon="uiw:plus" width="30" height="30" />
                                        <span>เลือกไฟล์</span>
                                    </Space>
                                </div>
                            </Upload.Dragger>
                        </Col >
                        <Col span={24} style={{ height: "30%" }}>
                            <Button style={{ width: "100%", height: "100%" }} type="primary" onClick={send} disabled={loading}>
                                <div style={{ width: "100%", fontSize: 20 }}>
                                    <Space size={20}>
                                        <Icon icon="octicon:upload-16" width="30" height="30" />
                                        <span>ส่ง</span>
                                    </Space>
                                </div>
                            </Button>
                        </Col >
                    </Row>
                </Card>
                <ToastContainer />
            </div>
        </div>
    ) : connectStatus === 'failed' ? (
        <div>
            <div style={{ position: 'fixed', width: '100%', textAlign: 'center', height: "5%" }}>
                <Icon icon="material-symbols:cancel-outline" style={{ color: 'red', fontSize: 80 }} />
                <h1 style={{ color: 'red' }}>ไม่พบหน้าอัปโหลดกรุณาสแกนใหม่</h1>
            </div>
        </div>
    ) : (
        <div></div>
    )
}