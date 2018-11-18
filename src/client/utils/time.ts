export function getTime() {
    const date = new Date();

    return `${date.getHours()}h:${date.getMinutes()}m:${date.getSeconds()}s`;
}