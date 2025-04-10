import React,{useState} from 'react'
import { Typography } from 'antd';

const { Paragraph } = Typography;
export default function CustomParagraph({rows, content, ...props}) {
    const [expand, setExpand] = useState(false);
    const [reload, setReload] = useState(0);

    const handleClick = () => {
        setExpand(false);
        setReload(prev=>prev+=1);
    }
    
    return (
        <div key={reload}>
            <Paragraph
                {...props}
                ellipsis={{
                    rows: rows,
                    expandable: true,
                    symbol: 'ดูเพิ่ม',
                    onExpand: () => setExpand(true)
                }}
            >
                {content} 
                {expand ? 
                    <label 
                        className='gx-text-primary'
                        style={{ cursor: "pointer" }} 
                        onClick={handleClick}
                    >
                        &nbsp;ซ่อน
                    </label>
                    :
                    null
                }
            </Paragraph>
        </div>
    )
}
