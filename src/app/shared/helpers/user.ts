
import { User } from "../../core/models/user/User.model";
import { LocalStorage } from './localStorage';

//  import { LocalStorage } from './localSortage';
export class UserHelper {

  /**
   * determine wheather or not a user is authenticate
   */
  static isConnect(): boolean {
    const user = LocalStorage.getItem('KIKEVENTADMIN_space_user');
    return user !== null && user !== undefined;
  }
  /**
   * Remove user data to the local DB
   */
  static logoutUser(): void {
    LocalStorage.delete('KIKEVENTADMIN_space_user');
    localStorage.removeItem('KIKEVENTADMIN_space_token');
  }

  /**
   * Get the current log user
   */
  // static getUser(): any {
  //   return JSON.parse(LocalStorage.getItem('KIKEVENTADMIN_space_user'));
  // }
 static getUser(): User | null {
  return LocalStorage.getItem('KIKEVENTADMIN_space_user') ? JSON.parse(LocalStorage.getItem('KIKEVENTADMIN_space_user')!) as User : null;
}

 

  static getUserId(): string | number | null {
    const user = LocalStorage.getItem('KIKEVENTADMIN_space_user');
    if (user !== null && user !== undefined) {
      const userJson = JSON.parse(user);
      return userJson.id;
    } else {
      return null;
    }
  }
  static getUserParam(param: string): any {
    const user = LocalStorage.getItem('KIKEVENTADMIN_space_user');
    if (user !== null && user !== undefined) {
      const userJson = JSON.parse(user);
      return userJson.user[param];
    } else {
      return null;
    }
  }
  static getUserToken(): any {
    const user = LocalStorage.getItem('KIKEVENTADMIN_space_user');
    const userJson = JSON.parse(user);
    if (userJson === null || userJson === undefined) {
      return 'ok';
    }
    return userJson.token;
  }

  /**
   * Add user data to the local DB
   * @param * user user object to be saved
   */
  static saveUser(user: any, token: string): void {
    LocalStorage.setItem('KIKEVENTADMIN_space_user', JSON.stringify(user));
    LocalStorage.setItem('KIKEVENTADMIN_space_token', token);
  }
  
}
