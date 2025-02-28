import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from './screens/SplashScreen';
import WelcomeScreen from './screens/WelcomeScreen';
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import CategoryScreen from './screens/CategoryScreen';
import PhonologicalProcessScreen from './screens/PhonologicalProcessScreen';
import SignupScreen from './screens/SignUpScreen';
import ProfileScreen from './screens/ProfileScreen';
import InitialDiagnosisScreen from './screens/Phonology/InitialDiagnosisScreen';
import AnalysisResultScreen from './screens/Phonology/AnalysisResultScreen';
import AddTherapyDataScreen from './screens/Phonology/AddTherapyDataScreen';
import ProcessDetailScreen from './screens/Phonology/ProcessDetailScreen';
import StutteringTherapy from './screens/stutter/StutteringTherapy';
import TherapyPracticeScreen from './screens/stutter/TherapyPractice';
import VoiceAnalysisScreen from './screens/stutter/BackingScreen';


const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash">
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Welcome" component={WelcomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignupScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Category" component={CategoryScreen} options={{ headerShown: false }} />
        <Stack.Screen name="phono" component={PhonologicalProcessScreen} options={{ headerShown: false }} />
        <Stack.Screen name="StutteringTherapy" component={StutteringTherapy} options={{ headerShown: false }} />
        <Stack.Screen name="TherapyPractice" component={TherapyPracticeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="VoiceAnalysisScreen" component={VoiceAnalysisScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="InitialDiagnosis" component={InitialDiagnosisScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} options={{ headerShown: false }} />
        <Stack.Screen name="addTherapy" component={AddTherapyDataScreen} options={{ headerShown: false }} />
        <Stack.Screen name="process" component={ProcessDetailScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
