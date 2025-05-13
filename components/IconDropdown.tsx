import { useState, ReactElement, cloneElement } from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Colors from '@/constants/Colors'

type Props = {
    menuIcon: ReactElement<{ size: number; }>;
    menuItems: ReactElement<{ size: number; }>[];
    size: number;
}

const IconDropdown = (props: Props) => {
    const [ open, setOpen ] = useState(false);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                onPress={() => setOpen(!open)}
                style={[styles.menuIconContainer, { width: props.size, height: props.size }]}
            >
                {cloneElement(props.menuIcon, { size: props.size })}
            </TouchableOpacity>
            {open && (
                <View style={[styles.dropdown, { width: props.size + 25 }]}>
                    {props.menuItems.map((item, index) => (
                        cloneElement(item, { key: index })
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
