/**
 * trimSymbols - removes consecutive identical symbols if they quantity bigger that size
 * @param {string} string - the initial string
 * @param {number} size - the allowed size of consecutive identical symbols
 * @returns {string} - the new string without extra symbols according passed size
 */
export function trimSymbols(string, size) {
    if(string === '') return string;
    if (size === 0 || size === 'undefined') return '';
    
    let arr = string.split('');
    let pos = 0;
  
    while (pos < arr.length) {
      const letter = arr[pos];
      let count = 0;
      
        while (letter === arr[pos]) {
          count++;
          
          if (count > size) {
            arr.splice(pos, 1);
          } else {
            pos++;
          }
            
        }
    }
  
  return arr.join('');
}
