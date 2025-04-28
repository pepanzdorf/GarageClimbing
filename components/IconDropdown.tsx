import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '../constants/Colors'

const IconDropdown = (props) => {
    const [open, setOpen] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => setOpen(!open)}
                style={[styles.menuIconContainer, { width: props.size, height: props.size }]}
            >
                {React.cloneElement(props.menuIcon, { size: props.size })}
            </TouchableOpacity>
            {open && (
                <View style={[styles.dropdown, { width: props.size + 25 }]}>
                    {props.menuItems.map((item, index) => (
                        React.cloneElement(item, { key: index })
                    ))}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    menuIconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    dropdown: {
        position: 'absolute',
        backgroundColor: Colors.darkerBackground,
        borderColor: Colors.borderDark,
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        top: '100%',
        alignItems: 'center',
        flexDirection: 'column',
    },
});

export default IconDropdown;
