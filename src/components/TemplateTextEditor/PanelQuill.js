import { Button, Col, Collapse, Form, Input, Row, Select } from "antd";
import "quill/dist/quill.snow.css";
import "react-quill/dist/quill.core.css";
import { filter } from "lodash"
import ReactQuill from "react-quill";
import styled from "styled-components";
import { modules, formats } from "../../constants/Text-Editor"
import { useRef } from "react";
const { Panel } = Collapse;

const CustomPanel = styled(Panel)`
  .ant-collapse-header-text {
    width: 100% !important;
  }
`;
const { Option } = Select;
export const PanelQuill = ({
    setCurrentReview,
    setScreeningReviewTemplateActive,
    form,
    setFriend,
    docFavTemplate = [],
    title,
    titleEn,
    typeName,
    onFinish,
    values,
    prevValues,
    userType,
    hiddenSelect = false,
    hiddenReview = false,
    customComponents = false,
    getTemplatePicture = false,
    defaultActive = true,
    extra = <div hidden></div>,
    disabled = false,
    activeKey = [],
    setActive = () => { },
    onBlur = () => { },
    showToolBar = false,
    hidden = false,
    getGocFavoriteTemplate = () => { },
    templateLoding = false,
    chiefComplaintLabelClassName = "gx-text-primary d-block pointer",
    setChiefComplaintLabelClassName = () => { },
    presentIllnessLabelClassName = "gx-text-primary d-block pointer",
    setPresentIllnessLabelClassName = () => { },
    pastHistoryLabelClassName = "gx-text-primary d-block pointer",
    setPastHistoryLabelClassName = () => { },
}) => {
    const optionsTemplate = filter(docFavTemplate, o => o[typeName])
    // console.log('optionsTemplate', optionsTemplate)
    const ref = useRef(typeName)
    let labelClassName = "gx-text-primary d-block pointer"
    switch (typeName) {
        case "chiefComplaint":
            labelClassName = chiefComplaintLabelClassName
            break;
        case "presentIllness":
            labelClassName = presentIllnessLabelClassName
            break;
        case "pastHistory":
            labelClassName = pastHistoryLabelClassName
            break;
        default:
            break;
    }
    return <div hidden={hidden}>
        <Collapse
            // bordered={false}
            defaultActiveKey={defaultActive ? ["1"] : false}
            className="mt-1"
            activeKey={activeKey}
            onChange={(keys) => {
                setActive(keys)
                if (keys.length) {
                    setTimeout(() => {
                        ref.current?.focus()
                    }, 200);
                }
            }}
        >
            <CustomPanel
                forceRender={true}
                header={
                    <Row align="middle" gutter={[4, 4]} style={{ flexDirection: "row", marginTop: -11, marginBottom: -11 }}>
                        <Col span={17}>
                            <label className={labelClassName}>{title}</label>
                            <label hidden={!titleEn} className="gx-text-primary d-block pointer">{titleEn}</label>
                        </Col>
                        <Col span={7}>
                            <Button
                                id={typeName}
                                hidden
                                onClick={e => {
                                    e.stopPropagation()
                                    ref.current?.focus()
                                }}
                            />
                            <Button
                                hidden={hiddenReview}
                                style={{ width: "100%", margin: 0 }}
                                type="primary"
                                size="small"
                                // style={{ float: "right", margin: 0 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setCurrentReview(typeName);
                                    setScreeningReviewTemplateActive(true);
                                }}
                            >
                                review
                            </Button>
                            <Select
                                hidden={hiddenSelect}
                                size="small"
                                style={{ width: "100%", margin: 0 }}
                                dropdownMatchSelectWidth={345}
                                showSearch
                                allowClear={true}
                                placeholder="Template"
                                optionFilterProp="children"
                                onChange={(templateId, d) => {
                                    const formValues = form.getFieldValue(typeName)
                                    form.setFieldsValue({
                                        [typeName]: `${formValues || ""} ${d?.detail?.[typeName] || ""}`,
                                    });
                                    getTemplatePicture && getTemplatePicture(templateId)
                                    setFriend((friend) => !friend);
                                }}
                                className="data-value"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    getGocFavoriteTemplate()
                                }}
                                loading={templateLoding}
                                dropdownRender={menu => templateLoding ? "กำลังค้นหา..." : menu}
                            >
                                {optionsTemplate?.map((val, index) => (
                                    <Option
                                        value={val?.favTemplateId}
                                        key={index}
                                        detail={val}
                                        className="data-value"
                                    >
                                        {val?.templateName}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                }
                key="1"
            >
                <div style={{ margin: -15, marginBottom: -24 }} >
                    {customComponents && customComponents}
                    <Row gutter={[8, 8]}>
                        <Col span={24}>
                            <div hidden>
                                <Form layout="vertical" form={form} onFinish={onFinish}>
                                    <Form.Item name={typeName}>
                                        <Input />
                                    </Form.Item>
                                </Form>
                            </div>
                            <div>
                                <ReactQuill
                                    ref={ref}
                                    theme="snow"
                                    modules={showToolBar ? modules : { ...modules, toolbar: false }}
                                    formats={formats}
                                    value={values?.[typeName]}
                                    onChange={(v) => {
                                        form.setFieldsValue({
                                            [typeName]: v,
                                            // isEdit: true,
                                        });
                                        // if (typeName === "chiefComplaint") {
                                        //     setChiefComplaintLabelClassName("gx-text-primary d-block pointer")
                                        // }
                                        switch (typeName) {
                                            case "chiefComplaint":
                                                setChiefComplaintLabelClassName("gx-text-primary d-block pointer")
                                                break;
                                            case "presentIllness":
                                                setPresentIllnessLabelClassName("gx-text-primary d-block pointer")
                                                break;
                                            case "pastHistory":
                                                setPastHistoryLabelClassName("gx-text-primary d-block pointer")
                                                break;
                                            default:
                                                break;
                                        }
                                    }}
                                    onBlur={() => onBlur()}
                                    style={{ height: "100%", backgroundColor: prevValues ? "#69f0ae" : "" }}
                                    disabled={disabled ? true : userType === "M" || userType === "D"}
                                />
                            </div>
                        </Col>
                        <Col span={24}>
                            {extra}
                        </Col>
                    </Row>
                </div>
            </CustomPanel>
        </Collapse>
    </div>
}
export default PanelQuill