package com.popomobile

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import android.os.Bundle
import android.widget.EditText

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
    // react-native-screens 버전 4.16 이상으로 올린다면 아래 Fabric 반영한 코드 추가해 줘야 함
    // import com.swmansion.rnscreens.fragment.restoration.RNScreensFragmentFactory;
    // getSupportFragmentManager().setFragmentFactory(new RNScreensFragmentFactory());
    super.onCreate(null)

    // react-native-screens 아래 TextInput은 isLaidOut()이 false로 남아, Android가 포커스 시 자동완성 요청을
    // 다음 layout()까지 미루는데 RN은 layout()을 다시 호출하지 않는다. 같은 위치로 layout()을 불러 요청을 흘려보낸다.
    // 관련 이슈: https://github.com/software-mansion/react-native-screens/issues/3130
    window.decorView.viewTreeObserver.addOnGlobalFocusChangeListener { _, focused ->
      if (focused is EditText && !focused.isLaidOut) {
        focused.layout(focused.left, focused.top, focused.right, focused.bottom)
      }
    }
  }
}
