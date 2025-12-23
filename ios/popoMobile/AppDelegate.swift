import UIKit
import React
import React_RCTAppDelegate
import ReactAppDependencyProvider
import Firebase

@main
class AppDelegate: RCTAppDelegate {
  override func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
    if let filePath = Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") {
      // https://rnfirebase.io/#configure-firebase-with-ios-credentials-react-native-077
      FirebaseApp.configure()
    } else {
      print("[FIREBASE] Warning: GoogleService-Info.plist not found!")
    }

    self.moduleName = "popoMobile"
    self.dependencyProvider = RCTAppDependencyProvider()

    // You can add your custom initial props in the dictionary below.
    // They will be passed down to the ViewController used by React Native.
    self.initialProps = [:]

    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }

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

  // MARK: - Deep Linking

  // Universal Links (https://)
  override func application(
    _ application: UIApplication,
    continue userActivity: NSUserActivity,
    restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void
  ) -> Bool {
    return RCTLinkingManager.application(
      application,
      continue: userActivity,
      restorationHandler: restorationHandler
    )
  }

  // Custom URL Schemes (popo://, popo-dev://)
  override func application(
    _ app: UIApplication,
    open url: URL,
    options: [UIApplication.OpenURLOptionsKey : Any] = [:]
  ) -> Bool {
    return RCTLinkingManager.application(app, open: url, options: options)
  }
}
