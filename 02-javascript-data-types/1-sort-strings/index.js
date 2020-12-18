/**
 * sortStrings - sorts array of string by two criteria "asc" or "desc"
 * @param {string[]} arr - the array of strings
 * @param {string} [param="asc"] param - the sorting type "asc" or "desc"
 * @returns {string[]}
 */
export function sortStrings(arr, param = 'asc') {
    const newArr = [...arr];
    const collator = new Intl.Collator('ru', {sensitivity: 'variant', caseFirst: 'upper'}, 
                                       'en', {sensitivity: 'case', caseFirst: 'upper'});

    const direction = param == 'desc'? -1 : 1;

    return newArr.sort( (a, b) => direction * collator.compare(a, b));
}
