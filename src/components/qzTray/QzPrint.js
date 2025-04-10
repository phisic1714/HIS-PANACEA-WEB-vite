import { env } from '../../env.js';
import axios from "axios";
import qz from "qz-tray";
import cert from "./digital-certificate.txt";

export const QzPrint = async (pdf = null, arrPdf = null, printerName = null, width = null, height = null, isLandscape = null, printCount = 1, setLoading = () => { }, isAuto = null) => {
  qz.security.setSignaturePromise(function (toSign) {
    return function (resolve, reject) {
      axios
        .get(`${env.REACT_APP_PANACEACHS_SERVER}/api/ReportService/SignMessage`, {
          params: { message: toSign },
          headers: {
            'Content-Type': 'text/plain',
          },
          cache: 'no-store',
        })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          reject(error);
        });
    };
  });
  qz.security.setCertificatePromise(function (resolve, reject) {
    axios(cert, {
    }).then(function (res) {
      res?.data ? resolve(res.data) : reject(res.data);
    });
  });
  if (pdf) {
    var link = document.createElement("a");
    link.innerHTML = "Download PDF file";
    link.download = "file.pdf";
    link.href = "data:application/pdf;base64," + pdf;
    document.body.appendChild(link);
    if (!qz.websocket.isActive()) {
      setLoading(true);
      await qz.websocket.connect().then(() => {
        qz.networking.device().then(data => console.log("%cDetail", "color: green; background: #d4a4a1; padding: 5px 10px;", data));
        if (printerName) {
          return qz.printers.find();
        } else {
          return qz.printers.getDefault();
        }
      }).then(printer => {
        var filterPrinter;

        if (printerName) {
          filterPrinter = printer.sort((a, b) => a.length - b.length).filter(p => {
            if (p === printerName) {
              return p /* ?.split("_")[0] */ === printerName;
            }
            var sharePrinter = p.includes(printerName);
            console.log(sharePrinter);
            if (sharePrinter) {
              return sharePrinter;
            } else {
              return p /* ?.split("_")[0] */ === printerName; /* ?.split("_")[0] */
            }
          });
        }

        let config = qz.configs.create(printerName ? filterPrinter[0] : printer, {
          rasterize: false,
          size: {
            width: width,
            height: height
          },
          units: "in",
          orientation: isAuto ? isAuto : isLandscape ? "landscape" : "portrait",
          copies: printCount,
          rotation: isAuto ? null : 180
        });
        return qz.print(config, [{
          type: "pixel",
          format: "pdf",
          flavor: "base64",
          data: pdf
        }]
        );
      })?.catch(error => console.log("error"))?.finally(() => {
        if (qz?.websocket?.isActive()) {
          qz?.websocket?.disconnect();
        }
        setLoading(false);
      });
    } else {
      console.log("Please Wait. Printer is runnig");
    }
  } else if (arrPdf) {
    for (let i = 0; i < arrPdf.length; i++) {
      await axios(arrPdf[i].data).then(async res => {
        if (!qz.websocket.isActive()) {
          await qz.websocket?.connect().then(() => {
            qz.networking.device().then(data => console.log("%cDetail", "color: green; background: #d4a4a1; padding: 5px 10px;", data));
            return qz.printers.find();
          }).then(printer => {
            let config = qz.configs.create("Microsoft Print to PDF");
            return qz.print(config, [{
              type: "pdf",
              format: "base64",
              data: res.data
            }]);
          }).catch(error => console.log(error)).finally(() => {
            if (qz?.websocket?.isActive()) {
              qz?.websocket?.disconnect();
            }
          });
        } else {
          console.log("Please Wait. Printer is runnig");
        }
      });
    }
  } else {
    alert("Error");
  }
};