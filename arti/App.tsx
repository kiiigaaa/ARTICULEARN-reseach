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

// AOS
import SpeechScreen from './screens/AOS/AOSSpeechScreen'
import AnalyticsScreen from './screens/AOS/AOSAnalyticsScreen'
import PronouncScreen from './screens/AOS/AOSPronouncScreen'
import GamingScreen from './screens/AOS/AOSGamingScreen'
import AOSGaming from './screens/AOS/AOSGaming'
import AOSRandomCheck from './screens/AOS/AOSRandomCheck';
import SoundMatchActivityScreen from './screens/Phonology/SoundMatchActivityScreen';
import TherapyCatalogueScreen from './screens/Phonology/TherapyCatalogueScreen';
import SentenceSafariScreen from './screens/Phonology/SentenceSafariScreen';
import SafariIntroScreen from './screens/Phonology/SentenceSafariComponents/SafariIntroScreen';
import SpinPracticeScreen from './screens/Phonology/SpinPracticeScreen';
import PerformanceDetailScreen from './screens/Phonology/PerformanceDetailScreen';
import PerformanceAnalyticsScreen from './screens/Phonology/PerformanceAnalyticsScreen';
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
        <Stack.Screen name="InitialDiagnosis" component={InitialDiagnosisScreen} options={{ headerTitle: 'Initial Diagnosis' }} />
        <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} options={{ headerTitle: 'Analysis Results' }} />
        <Stack.Screen name="addTherapy" component={AddTherapyDataScreen} options={{ headerShown: false }} />
        <Stack.Screen name="process" component={ProcessDetailScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SoundMatchActivity" component={SoundMatchActivityScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TherapyCatalogue" component={TherapyCatalogueScreen} options={{ headerTitle: 'Therapy Catalogue' }}/>
        <Stack.Screen name="SentenceSafari" component={SentenceSafariScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SafariIntro" component={SafariIntroScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="SpinPractice" component={SpinPracticeScreen} options={{ headerTitle: 'Spin Practice' }}/>
        <Stack.Screen name="Performance" component={PerformanceDetailScreen} options={{ headerShown: false }}/>
        <Stack.Screen name="PerformanceAnalytics" component={PerformanceAnalyticsScreen} options={{ headerTitle: 'Performance Analytics' }}/>



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
