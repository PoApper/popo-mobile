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

    // 환경 변수를 React Native로 전달
    let envConfig = Bundle.main.infoDictionary?["ENV_CONFIG"] as? String ?? "Development"
    let apiUrl = Bundle.main.infoDictionary?["API_URL"] as? String ?? "https://api.popo-dev.poapper.club"
    let paxiApiUrl = Bundle.main.infoDictionary?["PAXI_URL"] as? String ?? "https://api.paxi.popo-dev.poapper.club"

    self.initialProps = [
      "ENV_CONFIG": envConfig,
      "API_URL": apiUrl,
      "PAXI_URL": paxiApiUrl
    ]

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
}
