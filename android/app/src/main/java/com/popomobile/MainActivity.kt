package com.popomobile

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "popoMobile"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)

  // react-native-screens와 겹쳐서 Android OS가 앱을 다시 로드할 때 이전 상태를 보내지 않게 함
  // 관련 이슈: https://github.com/software-mansion/react-native-screens/issues/1481
  // 공식문서: https://www.npmjs.com/package/react-native-screens#Installation 의 Kotlin 부분 코드 참고
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
  }
}
