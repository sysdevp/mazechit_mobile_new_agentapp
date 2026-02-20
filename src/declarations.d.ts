declare module "*.svg" {
  import React from 'react';
  import { SvgProps } from "react-native-svg";
  const content: React.FC<SvgProps>;
  export default content;
}
declare module 'react-native-vector-icons/FontAwesome';
declare module 'react-native-vector-icons/FontAwesome5';
declare module 'react-native-vector-icons/MaterialIcons';
declare module 'react-native-vector-icons/Ionicons';
declare module 'react-native-vector-icons/Feather';
declare module 'react-native-vector-icons/Octicons';

declare module 'react-native-vector-icons/MaterialCommunityIcons' {
  import { Icon } from 'react-native-vector-icons/Icon';
  const MaterialCommunityIcons: Icon;
  export default MaterialCommunityIcons;
}
