import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import UserNotifications

@main
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?

  var reactNativeDelegate: ReactNativeDelegate?
  var reactNativeFactory: RCTReactNativeFactory?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let delegate = ReactNativeDelegate()
    let factory = RCTReactNativeFactory(delegate: delegate)
    delegate.dependencyProvider = RCTAppDependencyProvider()

    reactNativeDelegate = delegate
    reactNativeFactory = factory

    window = UIWindow(frame: UIScreen.main.bounds)

    factory.startReactNative(
      withModuleName: "EduLearn",
      in: window,
      launchOptions: launchOptions
    )

    // Setup notification handling
    setupNotifications()

    return true
  }

  // MARK: - Notification Setup
  func setupNotifications() {
    // Request user permissions
    UNUserNotificationCenter.current().requestAuthorization(options: [.alert, .sound, .badge]) { granted, error in
      if granted {
        DispatchQueue.main.async {
          UIApplication.shared.registerForRemoteNotifications()
        }
        print("[iOS Notifications] Permission granted")
      } else if let error = error {
        print("[iOS Notifications] Permission denied: \(error.localizedDescription)")
      }
    }

    // Set notification delegate
    let notificationDelegate = NotificationDelegateHandler()
    UNUserNotificationCenter.current().delegate = notificationDelegate

    // Register notification categories and actions
    registerNotificationActions()
  }

  func registerNotificationActions() {
    // Copy OTP Action
    let copyOTPAction = UNNotificationAction(
      identifier: "COPY_OTP",
      title: "Copy OTP",
      options: [.foreground]
    )

    // Open Link Action
    let openLinkAction = UNNotificationAction(
      identifier: "OPEN_LINK",
      title: "Open Link",
      options: [.foreground]
    )

    // OTP Category
    let otpCategory = UNNotificationCategory(
      identifier: "OTP_NOTIFICATION",
      actions: [copyOTPAction],
      intentIdentifiers: [],
      options: []
    )

    // Link Category
    let linkCategory = UNNotificationCategory(
      identifier: "LINK_NOTIFICATION",
      actions: [openLinkAction],
      intentIdentifiers: [],
      options: []
    )

    // Combined Category
    let combinedCategory = UNNotificationCategory(
      identifier: "COMBINED_NOTIFICATION",
      actions: [copyOTPAction, openLinkAction],
      intentIdentifiers: [],
      options: []
    )

    // Register all categories
    UNUserNotificationCenter.current().setNotificationCategories([
      otpCategory,
      linkCategory,
      combinedCategory
    ])

    print("[iOS Notifications] Notification categories registered")
  }

  // Handle remote notification received
  func application(
    _ application: UIApplication,
    didReceiveRemoteNotification userInfo: [AnyHashable: Any],
    fetchCompletionHandler completionHandler: @escaping (UIBackgroundFetchResult) -> Void
  ) {
    print("[iOS Notifications] Remote notification received: \(userInfo)")
    completionHandler(.newData)
  }

  // Handle successful device token registration
  func application(
    _ application: UIApplication,
    didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data
  ) {
    let token = deviceToken.map { String(format: "%02.2hhx", $0) }.joined()
    print("[iOS Notifications] Device token: \(token)")
    // Send token to backend via React Native
  }

  // Handle device token registration failure
  func application(
    _ application: UIApplication,
    didFailToRegisterForRemoteNotificationsWithError error: Error
  ) {
    print("[iOS Notifications] Failed to register for remote notifications: \(error)")
  }
}

class ReactNativeDelegate: RCTDefaultReactNativeFactoryDelegate {
  override func sourceURL(for bridge: RCTBridge) -> URL? {
    self.bundleURL()
  }

  override func bundleURL() -> URL? {
#if DEBUG
    RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
#else
    Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
