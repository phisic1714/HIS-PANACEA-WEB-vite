import React, {useState, useMemo} from 'react'
import { Image, Modal, Avatar, Button as ButtonAntd, Popconfirm } from 'antd'
import { FileFilled, FilePdfFilled, FileExcelFilled, FileZipFilled, FileWordFilled, DownloadOutlined } from '@ant-design/icons';
import {  Viewer, Worker } from '@react-pdf-viewer/core';
import { thumbnailPlugin } from '@react-pdf-viewer/thumbnail';
import { BiTrash } from 'react-icons/bi'

export default function FileCard({ fileId, base64, fileType, fileName, showRemove, onDelete=()=>{},  }) {
    const [pdfView, setPdfView] = useState(false)

    const downloadFilePdf = () => {
        const link = document.createElement('a');
        link.href = `data:application/pdf;filename=generated.pdf;base64,${base64}`
        link.download = (fileName || `${fileId}.pdf`);
        link.click();
    }


    const thumbnailPluginInstance = thumbnailPlugin();


    const genDownloadFile = (selectFileName, firstCharacter) => {
        // console.log(firstCharacter)
        if (selectFileName?.includes('doc') || firstCharacter === 'U'){
            const metadata = atob(base64);
            // console.log(metadata)
            if (metadata.includes('word/document.xml')){
                const url = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`
                return [(fileName || `${fileId}.doc`), url, <FileWordFilled key={1} style={{ fontSize: '50px' }}/>]
            }
            else if (metadata?.includes('xl/workbook.xml') || firstCharacter === '0'){
                const url = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`
                return [(fileName || `${fileId}.xlsx`), url, <FileExcelFilled  key={2} style={{ fontSize: '50px' }}/>]
            }
            else{
                const url = `data:application/x-zip-compressed;base64,${base64}`
                return [(fileName || `${fileId}.zip`), url, <FileZipFilled  key={3} style={{ fontSize: '50px' }}/>]
            }
        }
        else if (selectFileName?.includes('xlsx') || firstCharacter === '0'){
            const url = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64}`
            return [(fileName || `${fileId}.xlsx`), url, <FileExcelFilled  key={4} style={{ fontSize: '50px' }}/>]
        }
        else{
            return ['', '#']
        }
    }

    const pdfUrl = useMemo(() => {
        console.log(fileName)
        const firstCharacter = base64?.charAt(0)
        if (fileType === 'pdf' || firstCharacter === 'J'){
            const url = `data:application/pdf;filename=generated.pdf;base64,${base64}`
            return url
        }

        else{
            return '#'
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [base64, fileType])

    const fileDisplay = useMemo(() => {
        const firstCharacter = base64?.charAt(0)
        console.log(fileType, firstCharacter)
        if (fileName?.includes('jpeg') || firstCharacter === '/'){
            const fileNameDisplay = (fileName || `${fileId}.jpg`)
            return (
                <div style={{ textAlign: 'center' }}>
                    <Avatar
                        shape='square'
                        src={<Image
                            sizes={50}
                            src={`data:image/jpeg;base64,${base64}`}
                            alt={(fileName || `${fileId}.jpeg`)}
                        />
                        }
                        size={50}
                    />
                    <p style={{ marginTop: 10 }}>{fileNameDisplay}</p>
                </div>
            )
        }
        if (fileName?.includes('png') || firstCharacter === 'i'){
            const fileNameDisplay = (fileName || `${fileId}.png`)
            return (
                <div style={{ textAlign: 'center' }}>
                    <Avatar
                        shape='square'
                        src={<Image
                            sizes={50}
                            src={`data:image/png;base64,${base64}`}
                            alt={fileNameDisplay}
                        />
                        }
                        size={50}
                    /><br/>
                    <p style={{ marginTop: 10 }}>{fileNameDisplay}</p>
                </div>
            )
        }
        else if (fileName?.includes('pdf') || firstCharacter === 'J'){
            return (
                <div 
                    shape='square' 
                    size={80} 
                    className='gx-primary-color' 
                    onClick={() => {
                        console.log(pdfUrl)
                        setPdfView(true)
                    }}
                    style={{ textAlign: 'center' }}
                >
                    <FilePdfFilled style={{ fontSize: '50px' }}/><br/>
                    <p style={{ marginTop: 10, color: 'black' }}>{(fileName || `${fileId}.pdf`)}</p>
                </div>
            )
        }
        else{
            const [downloadFileName, url, Icon=(<FileFilled />)] = genDownloadFile(fileName, firstCharacter)
            return (
                <div className='gx-primary-color' style={{ textAlign: 'center' }}>
                    <a download={downloadFileName} href={url} className='gx-primary-color'>{Icon}</a><br/>
                    <p style={{ color: 'black', marginTop: 10  }}>{downloadFileName}</p>
                </div>
            )
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [base64, fileType])
    // useEffect(() => {
        
    // }, [base64])

    return (
        <div style={{ position: 'relative' }}>
            {showRemove && (<Popconfirm title='ลบไฟล์' okText='Yes' cancelText='No' onConfirm={onDelete}><ButtonAntd 
                style={{ 
                    color: "black", 
                    position: 'absolute',
                    display: 'block',
                    top: -10,
                    right: 0,
                    zIndex: 100,
                }}
                size='small'
                shape="circle" 
                icon={<BiTrash color="black"/>} 
            /></Popconfirm>)}
            {fileDisplay}
            <Modal
                visible={pdfView}
                onCancel={() => {
                    setPdfView(false)
                }}
                onOk={() => {
                    setPdfView(false)
                }}
                width={"1000px"}
            >
                <div style={{ padding: "0px 100px", textAlign: 'right' }} >
                    <button
                        className="rpv-core__minimal-button"
                        onClick={downloadFilePdf}
                    >
                        <DownloadOutlined />
                    </button>
                </div>
                <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.5.207/pdf.worker.min.js">
                    <Viewer fileUrl={pdfUrl} plugins={[thumbnailPluginInstance]}/>
                </Worker>
            </Modal>
        </div>
    )
}