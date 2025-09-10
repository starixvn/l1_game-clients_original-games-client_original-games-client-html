import { Base64 } from "base64-string";
import isNull from "lodash/isNull";

export class GameUtils {
    static base64: Base64;

    public static base64Decode(data: string): string {
        if (isNull(data)) {
            return "";
        }

        if (!GameUtils.base64) {
            GameUtils.base64 = new Base64();
        }
        return GameUtils.base64.decode(data);
    }

    public static base64Encode(data: string): string {
        if (isNull(data)) {
            return "";
        }

        if (!GameUtils.base64) {
            GameUtils.base64 = new Base64();
        }
        return GameUtils.base64.encode(data);
    }
}
