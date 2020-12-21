/**
 * createGetter - creates function getter which allows select value from object
 * @param {string} path - the strings path separated by dot
 * @returns {function} - function-getter which allow get value from object by set path
 */
export function createGetter(path) {
    const pathParts = path.split('.');
    
    return function(obj) {
        let depth = 0;
        return findValue(obj, depth);

        function findValue(newObj, depth) {
            if (typeof newObj[pathParts[depth]] === 'object') {
                return findValue(newObj[pathParts[depth]], ++depth);
            } else {
                return newObj[pathParts[depth]];
            }
        }
    }
}