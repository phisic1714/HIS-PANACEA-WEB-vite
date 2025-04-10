export default function concatBillGroupName(th, en) {
    if (th === en) return th
    return th.concat(en ? `(${en})` : "")
}