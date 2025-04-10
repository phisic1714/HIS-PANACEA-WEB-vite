export const labelTopicPrimary18 = (text, extraClass) => {
    return (
        <label
            className={`gx-text-primary fw-bold ${extraClass}`}
            style={{ fontSize: 18 }}
        >
            {text}
        </label>
    );
};
export const LabelTopicPrimary18 = ({ text = "", className = "", style = {}, ...props }) => {
    return (
        <label
            className={`gx-text-primary fw-bold ${className}`}
            style={{ fontSize: 18, ...style }}
            {...props}
        >
            {text}
        </label>
    );
};
export const labelTopicPrimary = (text, extraClass) => {
    return (
        <label className={`gx-text-primary fw-bold ${extraClass}`}>{text}</label>
    );
};
export const LabelTopicPrimary = ({ text = "", className = "", style = {} }) => {
    return (
        <label
            className={`gx-text-primary fw-bold ${className}`}
            style={{ ...style }}
        >
            {text}
        </label>
    );
};
export const LabelTextPrimary = ({ text = "", className = "", style = {} }) => {
    return (
        <label
            className={`gx-text-primary ${className}`}
            style={{ ...style }}
        >
            {text}
        </label>
    );
};
export const labelTopic18 = (text, extraClass) => {
    return (
        <label
            className={`${extraClass}`}
            style={{ fontSize: 18, fontWeight: "bold" }}
        >
            {text}
        </label>
    );
};
export const LabelTopic18 = ({ text = "", className = "" }) => {
    return (
        <label
            className={`${className}`}
            style={{ fontSize: 18, fontWeight: "bold" }}
        >
            {text}
        </label>
    );
};
export const labelTopicManu = (text, extraClass) => {
    return <label className={` fw-bold ${extraClass}`}>{text}</label>;
};
export const labelTopic = (text, extraClass) => {
    return <label className={`fw-bold ${extraClass}`}>{text}</label>;
};
export const LabelTopic = ({ text = "", className = "", style = {} }) => {
    return <label
        className={`fw-bold ${className}`}
        style={{ ...style }}
    >{text}</label>;
};
// export const labelText = (text, extraClass, time) => {
//     return <label style={{ display: "block", textAlign: "right" }} className={`me-5 mt-3 data-value fw-bold ${extraClass}`}>{text}   {time}</label>;
// };
export const labelText = (text, extraClass) => {
    return <label className={`data-value ${extraClass}`}>{text}</label>;
};
export const LabelText = ({ text = "", className = "", ...props }) => {
    return <label className={`data-value ${className}`} {...props}>{text}</label>;
};
export const GenFormItemLabel = ({ required = false, label, className = "d-block", style = { marginBottom: -2 } }) => {
    const formLabelRequired = <label className={className} style={{ ...style }}>
        <label style={{ color: "red" }}>*</label>
        <label className="data-value" style={{ color: "var(--primary-color)" }}>{label}</label>
    </label>
    const formLabel = <label style={{ ...style, color: "var(--primary-color)" }} className='data-value d-block'>{label}</label>
    return required ? formLabelRequired : formLabel
}