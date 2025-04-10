import dayjs from "dayjs";
import { isNaN, isNumber, toNumber } from "lodash";
import { toast } from "react-toastify";

export const TabTitle = (newTitle) => {
  return (document.title = newTitle === null ? "PANACEA+" : newTitle);
};

export const removeHtmlTags = (str) => {
  if (str === null || str === "") return false;
  else str = str.toString();

  return str.replace(/<[^>]*>/g, "");
};

export const formatBase64 = (base64) => {
  if (!base64) return;
  return `data:image/png;base64, ${base64}`;
};

export const resizeBase64Img = (base64, width = 85, height = 85) => {
  if (!base64) return;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      const resizedBase64 = canvas.toDataURL("image/png");
      resolve(resizedBase64);
    };
    img.src = base64;
  });
};

export const resizeImageFile = (file, maxWidth, maxHeight) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const fileReader = new FileReader();

    fileReader.onload = () => {
      img.src = fileReader.result;
    };

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      let width = img.width;
      let height = img.height;

      if (width > height && width > maxWidth) {
        height = Math.round((height *= maxWidth / width));
        width = maxWidth;
      } else if (height > maxHeight) {
        width = Math.round((width *= maxHeight / height));
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      resolve(canvas.toDataURL());
    };

    img.onerror = (error) => reject(error);
    fileReader.onerror = (error) => reject(error);

    fileReader.readAsDataURL(file);
  });
};

export const getBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      let encoded = reader.result.toString().replace(/^data:(.*,)?/, "");
      if (encoded.length % 4 > 0) {
        encoded += "=".repeat(4 - (encoded.length % 4));
      }
      resolve(encoded);
    };
    reader.onerror = (error) => reject(error);
  });
};

export const base64ToFile = (
  base64String,
  fileName,
  mimeType = "application/pdf"
) => {
  const base64Data = `data:${mimeType};base64,${base64String}`;
  const cleanBase64String = base64Data.replace(/[^A-Za-z0-9+/=]/g, "");
  const byteString = atob(cleanBase64String);
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  const file = new File([uint8Array], fileName, { type: mimeType });

  return file;
};

export const base64ToDataURL = (base64, mimeType = "image/png") => {
  if (!base64) return;
  return `data:${mimeType};base64,${base64}`;
};

export const autoConvertDates = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => autoConvertDates(item));
  } else if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (typeof obj[key] === "string") {
          if (/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/.test(obj[key])) {
            obj[key] = dayjs(obj[key]);
          }
          if (/\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(obj[key])) {
            obj[key] = dayjs(obj[key]);
          }
        } else if (typeof obj[key] === "object") {
          obj[key] = autoConvertDates(obj[key]);
        }
      }
    }
  }
  return obj;
};

export const autoFormatDayjsObjects = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((item) => autoFormatDayjsObjects(item));
  } else if (typeof obj === "object" && obj !== null) {
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        if (dayjs.isDayjs(obj[key])) {
          obj[key] = obj[key].format("YYYY-MM-DD HH:mm:ss");
        } else if (typeof obj[key] === "string") {
          if (/\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}:\d{2}/.test(obj[key])) {
            obj[key] = dayjs(obj[key]);
          }
        } else if (typeof obj[key] === "object") {
          obj[key] = autoFormatDayjsObjects(obj[key]);
        }
      }
    }
  }
  return obj;
};

export const formatDateDisplay = (dateString, defaultValue = "-") => {
  if (!dateString) return defaultValue;
  return dayjs(dateString).add(543, "y").format("DD/MM/YYYY HH:mm:ss");
};

export const formatDateOnlyDisplay = (dateString, defaultValue = "-") => {
  if (!dateString) return defaultValue;
  return dayjs(dateString).add(543, "y").format("DD/MM/YYYY");
};

export const formatTimeOnlyDisplay = (dateString, defaultValue = "-") => {
  if (!dateString) return defaultValue;
  return dayjs(dateString).add(543, "y").format("HH:mm:ss");
};

export const formatRemoveHtmlTag = (string) => {
  if (!string) return "";
  return string.replace(/<[^>]*>/g, "").replaceAll(/&nbsp;/g, "");
};

export const customToast = (msg = "", type = "success") => {
  const options = {
    position: "top-right",
    autoClose: 2500,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  };

  switch (type) {
    case "success":
      return toast.success(msg, options);
    case "error":
      return toast.error(msg, options);
    case "warning":
      return toast.warn(msg, options);
    default:
      return toast.info(msg, options);
  }
};

export const getContactInfo = (patientInfo) => {
  if (!patientInfo) return "";
  const mobile = patientInfo?.mobile;
  const telephone = patientInfo?.telephone;

  if (mobile && telephone && mobile !== telephone) {
    return (
      <label className="data-value">
        {mobile}, {telephone}
      </label>
    );
  } else {
    return <label className="data-value">{mobile || telephone || ""}</label>;
  }
};

export const updateFinanceFields = (
  finances,
  index,
  newCreditValue,
  record
) => {
  const amount = finances[index]?.amount ? toNumber(finances[index].amount) : 0;
  let credit =
    newCreditValue !== undefined
      ? toNumber(newCreditValue)
      : toNumber(finances[index].credit) || 0;
  let cashReturn = finances[index].cashReturn
    ? toNumber(finances[index].cashReturn)
    : 0;
  const discount = finances[index].discount
    ? toNumber(finances[index].discount)
    : 0;
  const payment = finances[index]?.payment
    ? toNumber(finances[index].payment)
    : 0;
  let offer = finances[index]?.offer ? toNumber(finances[index].offer) : 0;

  cashReturn = cashReturn > amount ? amount : cashReturn;

  if (newCreditValue !== undefined) {
    credit = credit > amount ? amount : credit;
    cashReturn = cashReturn > amount - credit ? amount - credit : cashReturn;
  } else {
    credit = amount - cashReturn;
  }

  if (record?.cashFlag === "Y") {
    credit = 0;
  }

  const cashNotReturn = amount - (credit + cashReturn);
  offer =
    record?.offerFlag === "Y" &&
    record?.autoMeaning !== "T" &&
    record?.notOffer !== "Y"
      ? cashNotReturn
      : 0;
  const overdue = cashReturn + cashNotReturn - (payment || 0) - (offer || 0);

  finances[index].discount =
    discount > cashNotReturn ? cashNotReturn : discount;
  finances[index].credit = credit;
  finances[index].cashReturn = cashReturn;
  finances[index].cashNotReturn = cashNotReturn;
  finances[index].overdue = overdue;
  finances[index].offer = offer;

  return finances;
};

export const toNumberFixed4 = (params) => {
  let temp = toNumber(params);
  let number = isNumber(temp);
  switch (number) {
    case true:
      return toNumber(temp.toFixed(4));
    case false:
      return 0;
    default:
      break;
  }
};

export const decimalToFixed2Comma = (value, max = 2) => {
  const maxToNumber = toNumber(max);
  const chkIsNaN = isNaN(maxToNumber);
  const result = new Intl.NumberFormat("TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: chkIsNaN ? 2 : maxToNumber,
  }).format(value);
  return result;
};

export const decimalToFixed2 = (value) =>
  new Intl.NumberFormat("TH", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(",", "");

export const toStringFixed2 = (params) => {
  let temp = toNumber(params);
  let number = isNumber(temp);
  switch (number) {
    case true:
      return temp.toFixed(2);
    case false:
      return "0";
    default:
      return "0";
  }
};

export const cleanBase64String = (base64String) => {
  if (typeof base64String !== "string") {
    return ""; // Return an empty string if input is not a valid string
  }

  const regex =
    /^data:(image\/(png|jpeg)|application\/(pdf|vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet|vnd\.ms-excel|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|msword)|text\/csv);base64,/;
  return base64String.replace(regex, "");
};

export const extensionToMimeTypeMap = {
  ".jpg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".webp": "image/webp",
  ".tiff": "image/tiff",
  ".pdf": "application/pdf",
  ".doc": "application/msword",
  ".docx":
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ".xls": "application/vnd.ms-excel",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ".csv": "text/csv",
};

export const extractFileName = (inputString) => {
  if (!inputString) return null;
  const fileName = inputString.slice(0, inputString.lastIndexOf("."));
  return fileName;
};

export const extractFileExtension = (inputString) => {
  if (!inputString) return null;
  const fileExtension = inputString.split(".").pop();
  return fileExtension;
};

export const renameKeysToLowerCase = (items) => {
  return items.map((item) => {
    const updatedItem = {};

    Object.entries(item).forEach(([key, value]) => {
      const updatedKey = key.charAt(0).toLowerCase() + key.slice(1);
      updatedItem[updatedKey] = value;
    });

    return updatedItem;
  });
};

export const cleanedSearchValue = (searchValue = "") => {
  if (searchValue === null || searchValue === undefined) return null;
  return searchValue.replace(/\s+/g, " ").trim();
};

export const separateLists = (list, key) => {
  const listNewImgLab = list.filter((item) => !item[key]);
  const listOldImgLab = list.filter((item) => item[key]);
  return { listNewImgLab, listOldImgLab };
};

export const formatNumber = (value) => {
  if (value == null || value === "") {
    return "0.00";
  }

  const number = parseFloat(value);
  if (isNaN(number)) {
    return "0.00";
  }

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const getCurrentDate = () => {
  return dayjs().format("YYYY-MM-DD HH:mm:ss");
};

export const getUserIdFromSession = () => {
  const userFromSession = JSON.parse(sessionStorage.getItem("user"));
  return userFromSession.responseData.userId;
};

export const checkWebSocketPort = async (url) => {
  return new Promise((resolve) => {
    const ws = new WebSocket(url);

    ws.onopen = () => {
      ws.close();
      resolve(true);
    };

    ws.onerror = () => {
      resolve(false);
    };
  });
};

export const generateOptions = (option) => {
  if (Array.isArray(option) && typeof option[0] === "string") {
    return option.map((item) => ({
      value: item,
      label: item,
    }));
  } else if (Array.isArray(option) && typeof option[0] === "object") {
    return option.map((item) => ({
      value: item.dataValue,
      label: item.dataName,
    }));
  }
};

export const toQueryparams = (queryparams) => {
  const filteredParams = Object.fromEntries(
    Object.entries(queryparams).filter(([_, v]) => v !== "" && v !== null)
  );
  const queryString = new URLSearchParams(filteredParams).toString();
  return queryString;
};
