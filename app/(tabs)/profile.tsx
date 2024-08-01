import React, { useContext, useState } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { GlobalStateContext } from '../context';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors'
import { Fonts } from '../../constants/Fonts'
import { apiURL } from '../../constants/Other';


export default function Profile(){
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ modalVisible, setModalVisible ] = useState(false);
    const { setToken, saveToken, loggedUser, isAdmin, token } = useContext(GlobalStateContext);
    const [ description, setDescription ] = useState('');

    const startSignup = () => {
        if (password !== '' && username !== '') {
            setModalVisible(true);
        } else {
            alert('Zadejte uživatelské jméno a heslo.');
        }
    }

    const handleSignup = async () => {
        if (password !== confirmPassword) {
            alert('Hesla se neshodují.');
        } else {
            try {
                const response = await fetch(`${apiURL}/climbing/signup`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ username: username, password: password }),
                });
                if (response.ok) {
                    alert(await response.text());
                    setModalVisible(false);
                } else if (response.status === 400) {
                    alert(await response.text());
                    setModalVisible(false);
                } else {
                    alert('Server error');
                }
            } catch (error) {
                alert('Server error');
            }
        }
    }

    const handleLogin = async () => {
        try {
            const response = await fetch(`${apiURL}/climbing/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username: username, password: password }),
            });
            if (response.ok) {
                const jsonResponse = await response.text();
                setToken(jsonResponse);
                saveToken(jsonResponse);
                alert(`Úspěšně přihlášen jako: ${username}`);
            } else if (response.status === 400) {
                alert(await response.text());
            } else if (response.status === 401) {
                alert(await response.text());
            } else {
                alert('Server error');
            }
        } catch (error) {
            alert('Server error');
        }
    };

    const logOut = () => {
        setToken('token');
        saveToken('token');
    }

    const sendDescription = async () => {
        try {
            const response = await fetch(`${apiURL}/climbing/set_description`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ description: description }),
            });
            if (response.ok) {
                alert(await response.text());
            } else if (response.status === 400) {
                alert(await response.text());
            } else {
                alert('Server error');
            }
        } catch (error) {
            alert('Server error');
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView>
                <View style={styles.login}>
                    <TextInput
                        style={styles.input}
                        placeholder="Uživatelské jméno"
                        value={username}
                        onChangeText={setUsername}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Heslo"
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                    <TouchableOpacity onPress={handleLogin}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Přihlásit</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={startSignup}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Registrovat</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={logOut}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Odhlásit se</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.info}>
                    <Text style={Fonts.h3}>
                        Přihlášen jako: { loggedUser }
                    </Text>
                    {
                        isAdmin ? (
                            <FontAwesome5 name="user-shield" size={24} color="black" />
                        ) : null
                    }
                </View>
                <View style={styles.info}>
                    <TextInput
                        style={styles.commentInput}
                        placeholder="Popisek u profilu"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                    />
                    <TouchableOpacity onPress={sendDescription}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Uložit popisek</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            <Modal visible={modalVisible}>
                <View style={styles.registration}>
                    <View>
                        <View style={styles.header}>
                            <Text style={Fonts.h1}>Registrace</Text>
                        </View>
                        <View style={styles.userinfo}>
                            <Text style={Fonts.h3}>Uživatelské jméno: {username}</Text>
                            <Text style={Fonts.h3}>Zopakujte heslo:</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Zopakujte heslo"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>
                    </View>
                    <TouchableOpacity onPress={handleSignup}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Zaregistrovat</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                        <View style={styles.button}>
                            <Text style={Fonts.h3}>Zavřít</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 80,
    },
    input: {
        height: 50,
        borderColor: Colors.borderDark,
        borderWidth: 2,
        marginBottom: 20,
        padding: 10,
    },
    login: {
        flex: 3,
        justifyContent: 'center',
        padding: 10,
    },
    info: {
        marginTop: 40,
        flex: 1,
        textAlign: 'center',
        padding: 10,
    },
    button: {
        backgroundColor: Colors.primary,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
        marginTop: 15,
    },
    registration: {
        flex: 1,
        padding: 30,
    },
    header: {
        alignItems: 'center',
        paddingTop: 30,
        marginBottom: 20,
    },
    userinfo: {
        padding: 10,
        gap: 20,
    },
    commentInput: {
        height: 200,
        borderColor: Colors.borderDark,
        borderWidth: 2,
        marginBottom: 20,
        padding: 10,
        multiline: true,
        textAlignVertical: 'top',
    },
});
