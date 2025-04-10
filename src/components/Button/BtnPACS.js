import { Button } from 'antd'
import { withResolve } from 'api/create-api.js';
import axios from 'axios';
import { env } from 'env';
import { toast } from 'react-toastify';

export default function BtnPACS({
    runhn,
    setLoading = () => false,
    ...props
}) {
    const fetchCreateSynapseTicketAsync = async () => {
        if (!runhn) return;
        setLoading(true);

        try {
            const { data } = await axios.get(`${env.REACT_APP_PANACEACHS_SERVER}/api/Pacs/CreateSynapseTicketAsync/${runhn}`);
            if (data) window.open(data, "_blank", "width=800,height=600,scrollbars=yes,resizable=yes");
        } catch {
            toast.error("เกิดข้อผิดพลาดในการเรียกข้อมูล", { position: "top-right", autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    return <Button
        type="text"
        size="middle"
        style={{
            backgroundColor: "var(--secondary-color)",
            color: "var(--primary-color)",
            fontWeight: "bold",
            marginBottom: "0px",
        }}
        disabled={!runhn}
        onClick={() => fetchCreateSynapseTicketAsync()} {...props}>ดูภาพ PACS</Button>
}