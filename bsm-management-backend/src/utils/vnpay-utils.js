export function sortObject(obj) {
  let sorted = {};
  let str = [];
  let key;
  for (key in obj) {
    // Thay vì dùng obj.hasOwnProperty(key)
    // Hãy dùng Object.prototype.hasOwnProperty.call(obj, key) để an toàn tuyệt đối
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      str.push(encodeURIComponent(key));
    }
  }
  str.sort();
  for (key = 0; key < str.length; key++) {
    sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, "+");
  }
  return sorted;
}