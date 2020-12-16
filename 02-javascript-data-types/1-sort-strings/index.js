/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    let newArr = [...arr];
    const collator = new Intl.Collator('ru', {sensitivity: 'variant', caseFirst: 'upper'}, 
                                       'en', {sensitivity: 'case', caseFirst: 'upper'});
                                       
    newArr.sort( (a, b) => collator.compare(a, b));

    if (param == 'desc') {
        return newArr.reverse();
    } else {
        return newArr;
    }
}
