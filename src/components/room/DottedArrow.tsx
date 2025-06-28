import React from 'react';
import Svg, {Line} from 'react-native-svg';

const DottedArrow = ({width = 200, height = 100, color = 'white'}) => {
  return (
    <Svg width={width} height={height}>
      {/* 점선 기둥 */}
      <Line
        x1="10"
        y1={height / 2}
        x2={width - 15}
        y2={height / 2}
        stroke={color}
        strokeWidth="2"
        strokeDasharray="6,6" // 점선 효과
      />

      {/* 화살촉 */}
      <Line
        x1={width - 20}
        y1={height / 2 - 10}
        x2={width - 10}
        y2={height / 2 + 0.5}
        stroke={color}
        strokeWidth="2"
      />
      <Line
        x1={width - 20}
        y1={height / 2 + 10}
        x2={width - 10}
        y2={height / 2 - 0.5}
        stroke={color}
        strokeWidth="2"
      />
    </Svg>
  );
};

export default DottedArrow;
