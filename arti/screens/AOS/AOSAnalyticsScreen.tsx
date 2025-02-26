import { View, Text, SafeAreaView, TouchableOpacity, Image, TextInput, StyleSheet } from 'react-native'
import React from 'react'
import COLORS from './styles/Styles'
import { FontAwesome, AntDesign, Entypo } from '@expo/vector-icons';

export default function AnalyticsScreen() {
  return (
    <SafeAreaView style={styles.container}>
        <View style={styles.header}>
            <AntDesign name="close" size={24} color="red" />
            <Text style={styles.title}>Apraxia of Speech</Text>
            <View />
        </View>
        <Text style={styles.title2}>Progress & Analytics</Text>

        <View style={styles.graphContainer}>
            {/* Add Your Graph Image Here */}
            <Text>Add Your Graph Image Here !</Text>
        </View>

        <View style={styles.lineContainer}>
            <View style={styles.lineOne} />
            <View style={styles.lineTwo} />
        </View>

        <View style={styles.bulletContainer}>
            <View style={styles.bulletRow}>
                <View style={styles.bulletOne} />
                <Text style={styles.bulletTextOne}>Completed</Text>
            </View>
            <View style={styles.bulletRow}>
                <View style={styles.bulletTwo} />
                <Text style={styles.bulletTextTwo}>Time Spent</Text>
            </View>
        </View>

        <View style={styles.cardRow}>
            <View style={styles.card}>
                <Text style={styles.cardText}>Pending Tasks</Text>
            </View>
            <View style={styles.card}>
                <Text style={styles.cardText}>Task Completed</Text>
                <Text style={styles.cardText}>150</Text>
            </View>
        </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#ebedef',
        height: '100%',
        width: '100%'
    },
    title: {
        color: '#7fb3d5',
        fontWeight: '700',
        fontSize: 20,
    },
    title2: {
        color: COLORS.BLACK,
        fontWeight: '700',
        fontSize: 20,
        textAlign: 'center',
        marginVertical: 5
    },
    header:{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 10,
        marginHorizontal: 20
    },
    graphContainer: {
        borderWidth: 2,
        borderColor: COLORS.BLUE,
        alignSelf: 'center',
        width: '85%',
        borderRadius: 5,
        padding: 10,
        marginVertical: 10 
    },
    lineContainer: {
        width: '80%',
        height: 10,
        alignSelf: 'center',
        flexDirection: 'row'
    },
    lineOne: {
        backgroundColor: COLORS.BLUE,
        width: '50%',
        flex: 1
    },
    lineTwo: {
        backgroundColor: COLORS.PURPLE,
        width: '50%',
        flex: 1
    },
    bulletContainer: {
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '70%',
        marginTop: 20
    },
    bulletRow: {
        alignSelf: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    bulletOne: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.BLUE,
        marginRight: 5
    },
    bulletTwo: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: COLORS.PURPLE,
        marginRight: 5
    },
    bulletTextOne: {
        color: COLORS.BLUE,
        fontWeight: '700'
    },
    bulletTextTwo: {
        color: COLORS.PURPLE,
        fontWeight: '700'
    },
    cardRow: {
        flexDirection: 'row',
        alignSelf: 'center',
        alignItems: 'center',
    },
    card: {
        borderWidth: 2,
        borderColor: COLORS.BLUE,
        elevation: 10,
        margin: 10,
        alignSelf: 'center',
        height: 60,
        width: 160,
        padding: 10,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 5
    },
    cardText: {
        color: COLORS.BLUE,
        fontWeight: '700'
    }
})