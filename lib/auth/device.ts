import { UAParser } from "ua-parser-js";

export function parseDevice(userAgent: string | null) {
    if (!userAgent) {
        return {
            deviceType: "unknown",
            deviceName: "Unknown Device",
            browser: "Unknown Browser",
            os: "Unknown OS",
        };
    }

    const parser = new UAParser(userAgent);

    const result = parser.getResult();

    const browser = result.browser.name ?? "Unknown Browser";
    const browserVersion = result.browser.version ?? "";

    const osName = result.os.name ?? "Unknown OS";
    const osVersion = result.os.version ?? "";

    const deviceType =
        result.device.type ?? "desktop";

    let deviceName = "Desktop";

    if (deviceType === "mobile") {
        if (osName === "iOS") {
            deviceName = "iPhone";
        } else if (osName === "Android") {
            deviceName = "Android Phone";
        } else {
            deviceName = "Mobile Device";
        }
    }

    if (deviceType === "tablet") {
        if (osName === "iOS") {
            deviceName = "iPad";
        } else if (osName === "Android") {
            deviceName = "Android Tablet";
        } else {
            deviceName = "Tablet";
        }
    }

    return {
        deviceType,
        deviceName,
        browser: browser,
        os: osVersion
            ? `${osName} ${osVersion}`
            : osName,
    };
}