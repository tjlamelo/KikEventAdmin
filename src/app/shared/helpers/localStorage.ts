export class LocalStorage {
  static salt = 'KIKEVENTADMIN_LOCALSTORAGE';
  /**
   * @constructor
   */

  /**
   * Encrypt data and save it in local DB
   * @param string label Label of stored item
   * @param string data Stringified data to be stored
   */
  static setItem(label: string, data: string): void {
    localStorage.setItem(label, this.encrypt(data));
  }

  /**
   * Encrypt data
   * @param string data Stringified data to be stored
   */
  static encrypt(data: string): string {
    data = data + this.salt;
    return btoa(unescape(encodeURIComponent(data)));
  }
  /**
   * Dencrypt data
   * @param string data Stringified data to be stored
   */
  static decrypt(data: string): string {
    data = decodeURIComponent(escape(window.atob(data)));
    data = data.replace(this.salt, '');
    return data;
  }
  /**
   * Get an item from the local DB
   * @param label Label of element to be extracted
   */
  static getItem(label: string): any {
    let data = window.localStorage.getItem(label);
    if (data != null) {
      data = this.decrypt(data);
    }
    return data;
  }
  /**
   * Remove an element from the local DB
   * @param label Label of the element to remove from the local DB
   */
  static delete(label: string): void {
    localStorage.removeItem(label);
  }
}
