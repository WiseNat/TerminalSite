export default class ObjectUtil {
  /**
   * Renames the string keys by removing occurrences of `prefix` from the
   * start of all keys.
   *
   * @param o the object to replace the keys of inline.
   * @param prefix the string prefix of the keys to remove.
   * @see removeKeyAffix
   */
  public static removeKeyPrefix(o: { [key: string]: unknown }, prefix: string) {
    this.removeKeyAffix(o, prefix, null);
  }

  /**
   * Renames the string keys by removing occurrences of `suffix` from the
   * end of all keys.
   *
   * @param o the object to replace the keys of inline.
   * @param suffix the string suffix of the keys to remove.
   * @see removeKeyAffix
   */
  public static removeKeySuffix(o: { [key: string]: unknown }, suffix: string) {
    this.removeKeyAffix(o, null, suffix);
  }

  /**
   * Renames the string keys by removing occurrences of `prefix` from the start
   * of all keys and `suffix` from the end of all keys.
   *
   * @param o the object to replace the keys of inline.
   * @param prefix the string prefix of the keys to remove.
   * @param suffix the string suffix of the keys to remove.
   */
  public static removeKeyAffix(
    o: { [key: string]: unknown },
    prefix: string | null,
    suffix: string | null,
  ) {
    for (const key of Object.keys(o)) {
      let newKey = key;

      if (prefix !== null && newKey.startsWith(prefix)) {
        newKey = newKey.slice(prefix.length);
      }

      if (suffix !== null && suffix.length !== 0 && newKey.endsWith(suffix)) {
        newKey = newKey.slice(0, -suffix.length);
      }

      if (newKey !== key) {
        o[newKey] = o[key];
        delete o[key];
      }
    }
  }
}
