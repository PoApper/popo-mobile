import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {AuthStackParamList} from '@navigation/types';
import LoginScreen from '@screens/auth/LoginScreen';
import LeaveScreen from '@screens/auth/LeaveScreen';

const AuthStack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Leave" component={LeaveScreen} />
    </AuthStack.Navigator>
  );
};

export default AuthNavigator;
