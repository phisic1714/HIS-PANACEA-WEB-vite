import { env } from '../../../env.js';
import React, { useState, useImperativeHandle, forwardRef } from 'react';
import { Row, Button, Modal } from 'antd';
import axios from "axios";
import { QzPrint } from "../../qzTray/QzPrint";
export default forwardRef(function Narcotic({
  // eslint-disable-next-line no-unused-vars
  ...props
}, ref) {
  const [narcoticVisible, setNarcoticVisible] = useState(false);
  const [orderId, setOrderId] = useState(null);
  useImperativeHandle(ref, () => ({
    setNarcoticVisible: props => setNarcoticVisible(props),
    setOrderId: props => setOrderId(props)
  }));
  const closeModal = () => {
    setNarcoticVisible(false);
  };
  const getPdfFile = (reportId, reportName, mrtFileName, sqlFileName, param) => {
    let req = {
      // reportId: reportId.toString(),
      reportId: reportId,
      reportName: reportName,
      mrtFileName: mrtFileName,
      sqlFileName: sqlFileName,
      dataTableName: sqlFileName,
      condition: param
      // reportName: "แบบประเมินผู้ป่วยระหว่างส่งตัว",
      // mrtFileName: "Assessment_Refer",
      // sqlFileName: "Assessment_Refer",
      // dataTableName: "Assessment_Refer",
      // condition: param,
    };

    // setLoading(true);

    axios.post(`${env.REACT_APP_PANACEA_REPORT}/api/ReportService/export-report-pdf`, req).then(res => {
      console.log(res.data);
      if (res.data.result) {
        if (res.data.result.previewFlag) {
          // eslint-disable-next-line no-useless-concat
          var winparams = "dependent=yes,locationbar=no,scrollbars=yes,menubar=yes," + "resizable,screenX=50,screenY=50,width=850,height=1050";
          const win = window.open("", "PDF", winparams);
          let html = "";
          html += "<html>";
          html += '<body style="margin:0!important">';
          html += '<embed width="100%" height="100%" src="data:application/pdf;base64,' + res.data.result.file + '" type="application/pdf" />';
          html += "</body>";
          html += "</html>";
          setTimeout(() => {
            win.document.write(html);
          }, 0);
          // var winparams = 'dependent=yes,locationbar=no,scrollbars=yes,menubar=yes,'+
          // 'resizable,screenX=50,screenY=50,width=850,height=1050';

          // var htmlPop =
          //   "<embed width=100% height=100%" +
          //   ' type="application/pdf"' +
          //   ' src="data:application/pdf;base64,' +
          //   res.data.result.file +
          //   '"></embed>';

          // var printWindow = window.open ("", "PDF", winparams);
          // printWindow.document.write(htmlPop);
          // printWindow.print();
        } else {
          // console.log(res.data.result.prefix);
          QzPrint(res.data.result.file, null, res.data.result.prefix);
        }
      }
    }).catch(error => {
      console.log(error);
    }).finally(() => {
      // setLoading(false);
    });
  };
  return <Modal title={<strong><label>14.2.10 พิมพ์ใบยาเสพติด</label></strong>} centered visible={narcoticVisible} onCancel={() => closeModal()} closable={false} footer={[<Row justify="center" key="footer">
    <Button key="cancel" onClick={() => {
      closeModal();
    }}>ไม่</Button>
    <Button key="ok" type="primary" onClick={() => {
      getPdfFile(null, "Narcotic5", "Narcotic5", "Narcotic5", {
        "@orderid": orderId
      });
      closeModal();
    }}>
      ใช่
    </Button>
  </Row>]}>
    ท่านต้องการพิมพ์ใบยาเสพติด หรือไม่?
  </Modal>;
});