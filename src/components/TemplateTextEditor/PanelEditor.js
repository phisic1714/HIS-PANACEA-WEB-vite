import { Button, Col, Collapse, Form, Input, Row, Select } from "antd";
import "quill/dist/quill.snow.css";
import { useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.core.css";
import styled from "styled-components";
import { formats, modules } from "../../constants/Text-Editor";

const { Panel } = Collapse;
const CustomPanel = styled(Panel)`
  .ant-collapse-header-text {
    width: 100% !important;
  }
`;

const { Option } = Select;
export const PanelTemplateComponents = ({
    setCurrentReview,
    setScreeningReviewTemplateActive,
    form,
    formProps = {},
    setFriend,
    docFavTemplate,
    title,
    titleEn,
    typeName,
    onFinish,
    values,
    userType,
    hiddenSelect = false,
    hiddenReview = false,
    customComponents = false,
    getTemplatePicture = false,
    defaultActive = true,
    extra = <div hidden></div>,
    disabled = false,
    showToolBar = false,
    onBlur = () => { },
}) => {
    const ref = useRef(typeName)

    return (
        <Collapse
            defaultActiveKey={defaultActive ? ['1'] : false}
            className="mt-1"
            onChange={(keys) => {
                if (keys.length) {
                    setTimeout(() => {
                        ref.current?.focus();
                    }, 200);
                }
            }}
        >
            <CustomPanel
                forceRender={true}
                header={
                    <Row
                        align="middle"
                        gutter={[4, 4]}
                        style={{
                            flexDirection: 'row',
                            marginTop: -11,
                            marginBottom: -11,
                        }}
                    >
                        <Col span={17}>
                            <label className="gx-text-primary d-block pointer">
                                {title}
                            </label>
                            <label
                                hidden={!titleEn}
                                className="gx-text-primary d-block pointer"
                            >
                                {titleEn}
                            </label>
                        </Col>
                        <Col span={7}>
                            <Button
                                id={typeName}
                                hidden
                                onClick={(e) => {
                                    e.stopPropagation();
                                    ref.current?.focus();
                                }}
                            />
                            <Button
                                hidden={hiddenReview}
                                style={{ width: '100%', margin: 0 }}
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
                                style={{ width: '100%', margin: 0 }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                }}
                                dropdownMatchSelectWidth={145}
                                showSearch
                                allowClear={true}
                                placeholder="Template"
                                optionFilterProp="children"
                                onChange={(templateId, d) => {
                                    const formValues = form.getFieldValue(typeName);
                                    form.setFieldsValue({
                                        [typeName]: `${formValues || ''} ${d?.detail?.[typeName] || ''}`,
                                    });
                                    getTemplatePicture && getTemplatePicture(templateId);
                                    setFriend((friend) => !friend);
                                }}
                                className="data-value"
                            >
                                {docFavTemplate?.map((val, index) => (
                                    <Option value={val?.favTemplateId} key={index} detail={val}>
                                        {val?.templateName}
                                    </Option>
                                ))}
                            </Select>
                        </Col>
                    </Row>
                }
                key="1"
            >
                <div style={{ margin: -12 }}>
                    {customComponents && customComponents}
                    <Row gutter={[8, 8]}>
                        <Col span={24}>
                            <div hidden>
                                <Form
                                    {...formProps}
                                    layout="vertical"
                                    form={form}
                                    onFinish={onFinish}
                                >
                                    <Form.Item name={typeName}>
                                        <Input />
                                    </Form.Item>
                                </Form>
                            </div>


                            <ReactQuill
                                ref={ref}
                                theme="snow"
                                modules={
                                    showToolBar ? modules : { ...modules, toolbar: false }
                                }
                                formats={formats}
                                value={values?.[typeName]}
                                onChange={(v) => {
                                    form.setFieldsValue({
                                        [typeName]: v,
                                        // isEdit: true,
                                    });
                                }}
                                style={{ height: '100%' }}
                                disabled={
                                    disabled ? true : userType === 'M' || userType === 'D'
                                }
                                onBlur={() => onBlur()}
                            />
                        </Col>
                        <Col span={24}>{extra}</Col>
                    </Row>
                </div>
            </CustomPanel>
        </Collapse>
    );
}
export default PanelTemplateComponents