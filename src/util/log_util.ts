// TODO: Change method implementations to be visible to users, rather than the dev console
export default class LogUtil {
  public static info(message: string) {
    console.log(message);
  }

  public static warn(message: string) {
    console.warn(message);
  }

  public static error(message: string) {
    console.error(message);
  }
}
