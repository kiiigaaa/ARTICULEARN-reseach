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

// AOS
import SpeechScreen from './screens/AOS/AOSSpeechScreen'
import AnalyticsScreen from './screens/AOS/AOSAnalyticsScreen'
import PronouncScreen from './screens/AOS/AOSPronouncScreen'
import GamingScreen from './screens/AOS/AOSGamingScreen'
import AOSGaming from './screens/AOS/AOSGaming'
import AOSRandomCheck from './screens/AOS/AOSRandomCheck';
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
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="InitialDiagnosis" component={InitialDiagnosisScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} options={{ headerShown: false }} />
        <Stack.Screen name="addTherapy" component={AddTherapyDataScreen} options={{ headerShown: false }} />
        <Stack.Screen name="process" component={ProcessDetailScreen} options={{ headerShown: false }} />

        {/* AOS */}
        <Stack.Screen name="ApraxiaHomeScreen" component={SpeechScreen} options={{ headerShown: false }} />
        <Stack.Screen name="PronounScreen" component={PronouncScreen} options={{ headerShown: false }} />
        <Stack.Screen name="GamingScreen" component={GamingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AnalyticsScreen" component={AnalyticsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CheckRandom" component={AOSRandomCheck} options={{ headerShown: false }} />
        <Stack.Screen name="AOSGaming" component={AOSGaming} options={{ headerShown: false }} />
        </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
