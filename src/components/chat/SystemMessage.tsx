import {View, Text, StyleSheet, useColorScheme} from 'react-native';

import {MessageData} from '@interfaces/paxi';
import {textColor} from '@styles/default';

const SystemMessage = ({message}: {message: MessageData}) => {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',
        marginTop: 5,
        marginBottom: 5,
      }}>
      <View style={styles.systemMessageBubble}>
        <Text
          style={{
            fontSize: 12,
            color: textColor(isDarkMode),
          }}>
          {message.message}
        </Text>
      </View>
    </View>
  );
};

export default SystemMessage;

const styles = StyleSheet.create({
  systemMessageBubble: {
    paddingVertical: 7,
    width: '100%',
    alignItems: 'center',
  },
});
