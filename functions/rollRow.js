// RNG 0 through 11 to decided bingo row without repeating
function rollRow() {
    let set = [0, 1, 2, 3, 4, 5, 6, 7];
    let previousNum;
    let randNum;
    let arrayElementIndex;

    // Get a random number from predefined set
    randNum = getRndmFromSet(set);

    // Get another random number if number was the last chosen number in the set
    while (previousNum == randNum) {
        randNum = getRndmFromSet(set);
    }

    // Record the previously chosen number
    previousNum = randNum;

    arrayElementIndex = set.indexOf(randNum)

    if (set.length > 0) {
        set.splice(arrayElementIndex, 1);
    } else {
        // Reset the set
        set = [0, 1, 2, 3, 4, 5, 6, 7];
        randNum = getRndmFromSet(set);

        // Get another random number if number was the last chosen number in the set before reset
        while (previousNum == randNum) {
            randNum = getRndmFromSet(set);
        }

        previousNum = randNum;
        arrayElementIndex = set.indexOf(randNum)
        set.splice(arrayElementIndex, 1);
    }

    function getRndmFromSet(set) {
        var rndm = Math.floor(Math.random() * set.length);
        return set[rndm];
    }

    return randNum;
}

module.exports = rollRow();