import React from 'react';
import {Image, ImageProps, StyleSheet, ImageSourcePropType} from 'react-native';

interface LazyImageProps extends Omit<ImageProps, 'source'> {
  uri?: string;
  fallbackSource?: ImageSourcePropType;
}

const defaultFallback = require('../../assets/icon/POPO_typography_bg_removed_cropped.png');

const LazyImage: React.FC<LazyImageProps> = ({
  uri,
  style,
  fallbackSource,
  resizeMode = 'cover',
  onError,
  ...props
}) => {
  const [failed, setFailed] = React.useState<boolean>(false);

  const source = !failed && uri ? {uri} : fallbackSource || defaultFallback;

  return (
    <Image
      source={source}
      style={[styles.image, style]}
      resizeMode={resizeMode}
      onError={e => {
        setFailed(true);
        onError?.(e);
      }}
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
