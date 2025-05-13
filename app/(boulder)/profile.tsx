import React, { useContext, useState } from "react";
import { View, Text, TextInput, StyleSheet, Modal, ScrollView } from 'react-native';
import { UserContext } from '@/context/UserContext';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FontAwesome5 } from '@expo/vector-icons';
import Fonts from '@/constants/Fonts'
import CommonStyles from '@/constants/CommonStyles';
import { apiURL } from '@/constants/Other';
import Button from "@/components/HorizontalButton";


export default function Profile(){
    const { setToken, saveToken, loggedUser, isAdmin, token } = useContext(UserContext);
    const [ username, setUsername ] = useState('');
    const [ password, setPassword ] = useState('');
    const [ confirmPassword, setConfirmPassword ] = useState('');
    const [ modalVisible, setModalVisible ] = useState(false);
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
                const response = await fetch(`${apiURL}/signup`, {
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
                    console.error('Server error');
                }
            } catch (error) {
                alert('Server error');
                console.error(error);
            }
        }
    }

    const handleLogin = async () => {
        try {
            const response = await fetch(`${apiURL}/login`, {
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
            console.error(error);
        }
    };

    const logOut = () => {
        setToken('token');
        saveToken('token');
        alert('Odhlášen');
    }

    const sendDescription = async () => {
        try {
            const response = await fetch(`${apiURL}/set_description`, {
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
            console.error(error);
        }
    }

    return (
        <SafeAreaView style={CommonStyles.paddedContainer}>
            <ScrollView>
                <TextInput
                    style={CommonStyles.input}
                    placeholder="Uživatelské jméno"
                    value={username}
                    onChangeText={setUsername}
                />
                <TextInput
                    style={CommonStyles.input}
                    placeholder="Heslo"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                <View style={CommonStyles.gapped}>
                    <Button label="Přihlásit" onPress={handleLogin} />
                    <Button label="Registrovat" onPress={startSignup} />
                    <Button label="Odhlásit se" onPress={logOut} />
                </View>
                <View style={styles.userinfo}>
                    <Text style={Fonts.h3}>
                        Přihlášen jako: { loggedUser }
                    </Text>
                    {
                        isAdmin ? (
                            <FontAwesome5 name="user-shield" size={24} color="black" />
                        ) : null
                    }
                    <TextInput
                        style={CommonStyles.multilineInput}
                        placeholder="Popisek u profilu"
                        value={description}
                        onChangeText={setDescription}
                        multiline={true}
                    />
                    <Button label={"Uložit popisek" } onPress={sendDescription} />
                </View>
            </ScrollView>

            <Modal visible={modalVisible}>
                <View style={CommonStyles.paddedContainer}>
                    <View style={CommonStyles.centered}>
                        <Text style={Fonts.h1}>Registrace</Text>
                    </View>
                    <View style={styles.userinfo}>
                        <Text style={Fonts.h3}>Uživatelské jméno: {username}</Text>
                        <Text style={Fonts.h3}>Zopakujte heslo:</Text>
                        <TextInput
                            style={CommonStyles.input}
                            placeholder="Zopakujte heslo"
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            secureTextEntry
                        />
                    </View>
                    <View style={CommonStyles.gapped}>
                        <Button label={"Zaregistrovat" } onPress={handleSignup} />
                        <Button label={"Zavřít" } onPress={() => setModalVisible(false)} />
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    userinfo: {
        marginTop: 40,
        gap: 20,
    },
});
