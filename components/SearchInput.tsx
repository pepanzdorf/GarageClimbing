import {StyleSheet, View, Text, TextInput, TouchableOpacity} from 'react-native';
import Colors from "@/constants/Colors";

type Props = {
    value: string;
    onChangeText: (value: string) => void;
};

export default function SearchInput({ value, onChangeText }: Props) {
    return (
        <View style={styles.searchContainer}>
            <TextInput
                placeholder="🔍 Vyhledat"
                value={value}
                onChangeText={onChangeText}
                style={styles.search}
                autoCapitalize={'none'}
                autoComplete={'off'}
                autoCorrect={false}
            />
            {
                value !== '' &&
                <TouchableOpacity onPress={() => onChangeText('')} style={styles.clearButton}>
                    <Text style={styles.clearButtonText}>×</Text>
                </TouchableOpacity>
            }
        </View>
    );
}

const styles = StyleSheet.create({
    searchContainer: {
        flex: 1,
    },
    search: {
        borderRadius: 10,
        backgroundColor: Colors.darkerBackground,
        borderWidth: 1,
        borderBottomColor: Colors.borderDark,
        marginHorizontal: 10,
        paddingRight: 35,
        paddingLeft: 15,
    },
    clearButton: {
        position: 'absolute',
        right: 16,
        top: -2
    },
    clearButtonText: {
        fontSize: 32,
        color: Colors.borderDark
    },
});
