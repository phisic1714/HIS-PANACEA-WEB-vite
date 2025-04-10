import { CloseCircleFilled, DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Input } from "antd";
import { useState } from "react";
// ทำไว้เพื่อให้ dropdown ที่เลือกแล้วแสดงค่าข้อความของตัวเลือกทั้งหมด ถ้าเกินช่องให้ขึ้นบรรทัดใหม่ ตาม issue 2164
const SelectWithTextArea = ({ options, placeholder = "", onChange, initvalue = '' }) => {
    const [value, setValue] = useState(initvalue); // ค่าใน textarea
    const [isDropdownVisible, setDropdownVisible] = useState(false); // ควบคุมการแสดง dropdown

    const handleOptionClick = (option) => {
        onChange(option.label)
        setValue(option.label); // ตั้งค่าใน textarea เป็นค่าที่เลือก
        setDropdownVisible(false); // ปิด dropdown หลังเลือก
    };

    return (
        <div style={{ position: "relative", width: "100%" }}>
            <div style={{ position: "relative" }}>
                {/* Input.TextArea */}
                <Input.TextArea
                    value={value}
                    placeholder={placeholder}
                    onClick={() => setDropdownVisible(!isDropdownVisible)} // เปิด/ปิด Dropdown เมื่อคลิก
                    onChange={(e) => setValue(e.target.value)} // อัปเดตค่าเมื่อผู้ใช้พิมพ์
                    autoSize={{ minRows: 1, maxRows: 5 }} // ปรับขนาด TextArea อัตโนมัติ
                    style={{
                        cursor: "pointer",
                        whiteSpace: "pre-wrap", // ให้ข้อความตกบรรทัดใหม่
                        wordBreak: "break-word", // ตัดคำถ้ายาวเกิน
                    }}

                />
                <div
                    style={{
                        position: "absolute",
                        right: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "15px",
                        color: "#bfbfbf",
                        cursor: "pointer",
                    }}
                >
                    {isDropdownVisible ? <SearchOutlined /> : value ? <CloseCircleFilled onClick={() => { setValue('') }} /> : <DownOutlined />}
                </div>
            </div>
            {/* Dropdown ตัวเลือก */}
            {isDropdownVisible && (
                <div
                    style={{
                        position: "absolute",
                        top: "100%",
                        left: 0,
                        width: "100%",
                        border: "1px solid #d9d9d9",
                        borderRadius: "4px",
                        backgroundColor: "#fff",
                        maxHeight: "150px",
                        overflowY: "auto",
                        zIndex: 10,
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                    }} onMouseLeave={() => { setDropdownVisible(false) }}

                >
                    {options.map((option) => (
                        <div
                            key={option.value}
                            onClick={() => handleOptionClick(option)} // เลือกค่าเมื่อคลิก
                            style={{
                                padding: "8px",
                                cursor: "pointer",
                                whiteSpace: "normal",
                                wordBreak: "break-word",
                                backgroundColor: "#fff",
                            }}
                            onMouseEnter={(e) => (e.target.style.backgroundColor = JSON.parse(
                                localStorage.getItem('themeColor')
                            ).secondaryColor)}
                            onMouseLeave={(e) => (e.target.style.backgroundColor = "#fff")}
                        >
                            {option.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


export default SelectWithTextArea;
