export class Helpers {
  // Palette de couleurs ou mapping réutilisable
  static colors: Record<string, string> = {
    primary: '#3b82f6',
    secondary: '#f5b91f',
    success: '#10b981',
    danger: '#ef4444',
    warning: '#f59e0b',
    info: '#0ea5e9',
    light: '#f3f4f6',
    dark: '#1f2937',
  };

  /**
   * Convertir un objet en FormData
   * @param object l'objet à insérer dans le FormData
   * @returns FormData
   */
  static toFormData(object: any): FormData {
    const formData = new FormData();
    for (const key in object) {
      if (object.hasOwnProperty(key) && object[key] !== undefined && object[key] !== null) {
        // Si c'est un tableau, on ajoute chaque élément
        if (Array.isArray(object[key])) {
          object[key].forEach((value: any) => formData.append(`${key}[]`, value));
        } else {
          formData.append(key, object[key]);
        }
      }
    }
    return formData;
  }

  /**
   * Retourne les deux premières lettres d'un nom
   * @param name le texte
   * @returns string
   */
  static getInitial(name: string): string {
    if (!name) return '';
    return name.trim().substring(0, 2).toUpperCase();
  }

  /**
   * Couper un texte sur un nombre de mots
   * @param text le texte à couper
   * @param numberOfWords nombre de mots souhaité
   * @returns string
   */
  static truncateText(text: string, numberOfWords: number): string {
    if (!text) return '';
    const words = text.trim().split(' ');
    if (words.length > numberOfWords) {
      return words.slice(0, numberOfWords).join(' ') + '...';
    }
    return text;
  }

  /**
   * Récupérer les deux premières lettres d'un mot (sigle)
   * @param name string
   * @returns string
   */
  static getSigle(name: string): string {
    if (!name) return '';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    } else if (words[0].length >= 2) {
      return words[0].substring(0, 2).toUpperCase();
    }
    return words[0][0].toUpperCase();
  }

  /**
   * Calculer l'âge à partir d'une date ISO
   * @param date string ou Date
   * @returns number
   */
  static getAge(date: string | Date): number {
    if (!date) return 0;
    const birthDate = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Remplacer un texte vide, null ou undefined par une valeur donnée
   * @param value valeur à vérifier
   * @param replacedBy valeur de remplacement
   * @returns string | null | undefined
   */
  static formatEmptyText(value: any, replacedBy: string | undefined | null = null): string | undefined | null {
    if (value === undefined || value === null || String(value).trim() === '') {
      return replacedBy;
    } else {
      return value;
    }
  }
}
