import {View, Text, StyleSheet} from 'react-native';

import {MessageData} from '@interfaces/paxi';

const SystemMessage = ({message}: {message: MessageData}) => {
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
            color: '#000',
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
