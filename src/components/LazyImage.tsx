import React from 'react';
import {Image, ImageProps, StyleSheet} from 'react-native';

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  uri: string;
}

const LazyImage: React.FC<LazyImageProps> = ({uri, style, ...props}) => {
  return (
    <Image
      source={{uri}}
      style={[styles.image, style]}
      resizeMode="cover"
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
});

export default LazyImage;
