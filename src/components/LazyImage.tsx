import React, {useState} from 'react';
import {View, ActivityIndicator, StyleSheet} from 'react-native';
import FastImage from 'react-native-fast-image';

interface LazyImageProps {
  uri: string;
  style?: any;
}

const LazyImage = ({uri, style}: LazyImageProps) => {
  const [loading, setLoading] = useState(true);
  return (
    <View style={style}>
      {loading && (
        <View
          style={[
            StyleSheet.absoluteFill,
            {justifyContent: 'center', alignItems: 'center', zIndex: 1},
          ]}>
          <ActivityIndicator size="small" color="#FB5353" />
        </View>
      )}
      <FastImage
        style={[StyleSheet.absoluteFill, style]}
        source={{uri}}
        resizeMode={FastImage.resizeMode.cover}
        onLoadEnd={() => setLoading(false)}
      />
    </View>
  );
};

export default LazyImage;
