import { notification } from 'antd';

export function notificationX(type, title, topic, width = 444, duration = 5) {
    notification[type ? "success" : "warning"]({
        message: (
            <label
                className={type ? "gx-text-primary" : ""}
                style={type ? { fontSize: 16 } : { fontSize: 16, color: "red" }}
            >
                {title}
            </label>
        ),
        description: (
            <label
                className={type ? "gx-text-primary" : ""}
                style={type ? { fontSize: 16 } : { fontSize: 16, color: "red" }}
            >
                {topic ? (
                    <label>{topic}</label>
                ) : (
                    <label>{type ? "สำเร็จ" : "ไม่สำเร็จ"}</label>
                )}
            </label>
        ),
        duration: duration,
        style: { width: width }
    });
}
export function notiWarning({
    message = null,
    description = null,
    width = 444,
    duration = 5
}) {
    notification["warning"]({
        message: <label className='fw-bold'>{message}</label>,
        description: description,
        duration: duration,
        style: { width: width }
    });
}
export function notiSuccess({
    message = "บันทึกข้อมูล",
    width = 444,
    duration = 5
}) {
    notification["success"]({
        message: <label className='fw-bold'>{message}</label>,
        description: <label className='gx-text-primary fw-bold'>สำเร็จ</label>,
        duration: duration,
        style: { width: width }
    });
}
export function notiError({
    message = "บันทึกข้อมูล",
    description = null,
    width = 444,
    duration = 5000
}) {
    notification["error"]({
        message: <label className='fw-bold'>{message}</label>,
        description: <>
            <label className='fw-bold d-block' style={{ color: "red" }}>ไม่สำเร็จ !</label>
            {
                description && <label className='data-value' style={{ display: 'block' }}>{description}</label>
            }
        </>,
        autoClose: duration,
        style: { width: width },
        hideProgressBar: false,
        progress: undefined,
        draggable: true,
    });
}
