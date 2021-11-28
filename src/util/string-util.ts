const reverseString = (str = "") => {
    if (typeof str !== "string") throw TypeError();

    return str.split("").reverse().join("");
};

export default {
    reverseString
}

