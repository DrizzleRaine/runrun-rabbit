module.exports.initialise = function initialise(size, elem) {
    var arr = [];
    for (var i = 0; i < size; ++i) {
        if (typeof(elem) === 'function') {
            arr[i] = elem();
        } else {
            arr[i] = elem;
        }
    }
    return arr;
};