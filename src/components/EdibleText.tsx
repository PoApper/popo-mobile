import * as React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    Alert,
} from 'react-native';
import { Menu, Provider } from 'react-native-paper';

const EdibleText = () => {
  const [menuVisible, setMenuVisible] = React.useState(false);
  const [anchorPos, setAnchorPos] = React.useState({ x: 0, y: 0 });

  const handleLongPress = (event: any) => {
    const { pageX, pageY } = event.nativeEvent;
    setAnchorPos({ x: pageX, y: pageY });
    setMenuVisible(true);
  };

  const closeMenu = () => setMenuVisible(false);

  const handleOptionSelect = (option: string) => {
    closeMenu();
    Alert.alert('알림', `${option} 선택됨`);
  };

  return (
    <Provider>
      <View style={styles.container}>
        <Pressable onLongPress={handleLongPress}>
          <Text style={styles.textContent}>여기에 텍스트 내용이 들어갑니다. 꾹 눌러보세요.</Text>
        </Pressable>

        <Menu
          visible={menuVisible}
          onDismiss={closeMenu}
          anchor={anchorPos}
        >
          <Menu.Item onPress={() => handleOptionSelect('수정')} title="수정" />
          <Menu.Item onPress={() => handleOptionSelect('삭제')} title="삭제" />
        </Menu>
      </View>
    </Provider>
  );
};

export default EdibleText;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  textContent: {
    fontSize: 18,
    padding: 15,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
});
