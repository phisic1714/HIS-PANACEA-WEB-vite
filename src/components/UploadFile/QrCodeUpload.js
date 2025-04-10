import React, { useEffect, useState } from "react";
import { Image, Spin, Tooltip } from 'antd'
import useSignalrHub from "libs/useSignalrHub";
import { env } from '../../env.js';
import axios from "axios";
import { nanoid } from "nanoid";

export default function QrCodeUpload({ width = 100, onUpdateImages = () => { } }) {
    const QrUploadHub = useSignalrHub('/UploadPic')
    const [qrCodeData, setQrCodeData] = useState(null)
    const user = JSON.parse(sessionStorage.getItem('user')).responseData

    const getQrCode = async (guid) => {
        const qrcodeResult = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/QrCode/GenerateQRCode?url=${guid}`).then((res) => {
            return res.data.responseData
        }).catch(() => {
            return null
        })
        return qrcodeResult
    }

    const genQrCode = async () => {
        const token = localStorage.getItem('token')
        const qrCodeData = await getQrCode(`${window.location.protocol}//${window.location.hostname}:${window.location.port}/qrupload/${nanoid()}?token=${token}`)
        setQrCodeData(qrCodeData)
    }

    const updateImages = async (imagesPath) => {
        const files = await Promise.all(imagesPath?.map((item) => {
            const res = axios.get(item.path, {
                responseType: 'blob'
            }).then(response => {
                return {
                    file: new File([response.data], item.path?.split('/')[4], { type: 'image/png' }),
                    url: item.path
                }
            })
            return res
        }))
        onUpdateImages(files)
    }

    const joinQrUploadHub = async () => {
        const groupId = qrCodeData?.url.split('/')[4]
        const cleanId = groupId.split("?")[0];
        if (QrUploadHub.connection?.connectionState === 'Disconnected') {
            await QrUploadHub.start()
            QrUploadHub.on('UploadMultiPic', (user, message) => {
                updateImages(message)
            })
            await QrUploadHub.joinGroup('JoinGroup', {
                userId: user?.userId,
                urlGroup: cleanId
            })
        }
    }

    useEffect(() => {
        genQrCode()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if (QrUploadHub && qrCodeData) {
            joinQrUploadHub()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [QrUploadHub, qrCodeData])

    return (
        <Spin spinning={!qrCodeData} style={{ width: "100%" }}>
            {qrCodeData ? (
                <Tooltip placement="top" title={'อัพโหลดจาก QR Code'}>
                    <Image
                        loading=""
                        src={`data:image/jpeg;base64,${qrCodeData?.qrPic}`}
                        width={width}
                    />
                </Tooltip>
            ) : <div style={{ width: "100%", height: width }}></div>}
        </Spin>
    )
}