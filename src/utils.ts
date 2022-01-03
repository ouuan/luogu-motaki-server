export function dateTimeString(timeStamp?: number) {
  return (timeStamp ? new Date(timeStamp) : new Date()).toLocaleString('zh-cn');
}
