/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    switch (param) {
        case 'asc':
            return makeSort(arr, 1);
        case 'desc':
            return makeSort(arr, -1);
        default:
            return arr;
    }
}

function makeSort(arr, direction) {
    const collator = new Intl.Collator('ru', {caseFirst: 'upper'}, 
                                       'en', {caseFirst: 'upper'});

    return [...arr].sort((a, b) => direction * collator.compare(a, b));
}
