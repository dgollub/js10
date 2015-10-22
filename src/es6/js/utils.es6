/*
 *  Utility functions
 */
 
let getRandomInt = (min, max = false) => {
    if (max === false) {
        max = min;
        min = 0;
    }
    return parseInt(Math.floor(Math.random() * (max - min + 1)) + min, 10);
};

export { getRandomInt };
