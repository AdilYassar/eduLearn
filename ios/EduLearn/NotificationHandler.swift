import UIKit
import UserNotifications

// MARK: - Notification Content Analyzer
struct NotificationAnalysis {
    let hasOTP: Bool
    let otp: String?
    let hasLinks: Bool
    let links: [String]
}

class NotificationContentAnalyzer {
    static func extractOTP(from text: String) -> String? {
        let patterns = [
            "\\b(\\d{6})\\b",           // 6 digits
            "\\b(\\d{4})\\b",           // 4 digits
            "\\b(\\d{3})-(\\d{3})\\b",  // 3-3 digits
            "\\b(\\d{3})-(\\d{4})\\b"   // 3-4 digits
        ]

        for patternStr in patterns {
            do {
                let regex = try NSRegularExpression(pattern: patternStr)
                if let match = regex.firstMatch(in: text, range: NSRange(text.startIndex..., in: text)) {
                    if let range = Range(match.range(at: 0), in: text) {
                        let otp = String(text[range]).replacingOccurrences(of: "[-\\s]", with: "", options: .regularExpression)
                        if otp.count >= 4 && otp.count <= 6 {
                            return otp
                        }
                    }
                }
            } catch { }
        }
        return nil
    }

    static func extractLinks(from text: String) -> [String] {
        var links: [String] = []
        var urls = Set<String>()

        // HTTP/HTTPS URLs
        let httpPattern = "https?://[^\\s]+"
        do {
            let regex = try NSRegularExpression(pattern: httpPattern)
            let matches = regex.matches(in: text, range: NSRange(text.startIndex..., in: text))
            for match in matches {
                if let range = Range(match.range, in: text) {
                    var url = String(text[range]).trimmingCharacters(in: .whitespaces)
                    if url.hasSuffix(".") || url.hasSuffix(",") || url.hasSuffix(";") {
                        url.removeLast()
                    }
                    if urls.insert(url).inserted {
                        links.append(url)
                    }
                }
            }
        } catch { }

        // WWW URLs
        let wwwPattern = "www\\.[^\\s]+"
        do {
            let regex = try NSRegularExpression(pattern: wwwPattern)
            let matches = regex.matches(in: text, range: NSRange(text.startIndex..., in: text))
            for match in matches {
                if let range = Range(match.range, in: text) {
                    var url = "https://" + String(text[range]).trimmingCharacters(in: .whitespaces)
                    if url.hasSuffix(".") || url.hasSuffix(",") || url.hasSuffix(";") {
                        url.removeLast()
                    }
                    if urls.insert(url).inserted {
                        links.append(url)
                    }
                }
            }
        } catch { }

        return links
    }

    static func analyze(_ text: String) -> NotificationAnalysis {
        let otp = extractOTP(from: text)
        let links = extractLinks(from: text)

        return NotificationAnalysis(
            hasOTP: otp != nil,
            otp: otp,
            hasLinks: !links.isEmpty,
            links: links
        )
    }
}

// MARK: - Notification Delegate Handler
class NotificationDelegateHandler: NSObject, UNUserNotificationCenterDelegate {
    
    // Handle notification when app is in foreground
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        willPresent notification: UNNotification,
        withCompletionHandler completionHandler: @escaping (UNNotificationPresentationOptions) -> Void
    ) {
        let userInfo = notification.request.content.userInfo
        let title = notification.request.content.title
        let body = notification.request.content.body

        print("[iOS Notification] Foreground - Title: \(title), Body: \(body)")

        // Always show notification even when app is in foreground
        if #available(iOS 14.0, *) {
            completionHandler([.banner, .sound, .badge])
        } else {
            completionHandler([.sound, .badge])
        }
    }

    // Handle notification tap and custom actions
    func userNotificationCenter(
        _ center: UNUserNotificationCenter,
        didReceive response: UNNotificationResponse,
        withCompletionHandler completionHandler: @escaping () -> Void
    ) {
        let userInfo = response.notification.request.content.userInfo
        let actionIdentifier = response.actionIdentifier

        // Get notification body for analysis
        let body = response.notification.request.content.body
        let analysis = NotificationContentAnalyzer.analyze(body)

        print("[iOS Notification] Action: \(actionIdentifier)")

        switch actionIdentifier {
        case "COPY_OTP":
            if let otp = analysis.otp {
                copyToClipboard(otp)
            }
        case "OPEN_LINK":
            if !analysis.links.isEmpty, let link = analysis.links.first {
                openLink(link)
            }
        case UNNotificationDefaultActionIdentifier:
            // Default tap action
            print("[iOS Notification] Default tap - userInfo: \(userInfo)")
        default:
            break
        }

        completionHandler()
    }

    private func copyToClipboard(_ text: String) {
        UIPasteboard.general.string = text
        print("[iOS Notification] Copied to clipboard: \(text)")
        showToast("OTP copied to clipboard")
    }

    private func openLink(_ link: String) {
        var urlString = link
        if !urlString.hasPrefix("http://") && !urlString.hasPrefix("https://") {
            urlString = "https://" + urlString
        }

        if let url = URL(string: urlString) {
            DispatchQueue.main.async {
                UIApplication.shared.open(url)
            }
            print("[iOS Notification] Opening link: \(urlString)")
        }
    }

    private func showToast(_ message: String) {
        DispatchQueue.main.async {
            let alert = UIAlertController(title: nil, message: message, preferredStyle: .alert)
            if let keyWindow = UIApplication.shared.keyWindow {
                keyWindow.rootViewController?.present(alert, animated: true)
                DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
                    alert.dismiss(animated: true)
                }
            }
        }
    }
}
