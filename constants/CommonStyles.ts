import { StyleSheet } from "react-native";
import Colors from "@/constants/Colors";

const CommonStyles = StyleSheet.create({
    container: {
        flex: 1,
    },
    paddedContainerHorizontal: {
        flex: 1,
        paddingHorizontal: 25,
    },
    paddedContainerTop: {
        flex: 1,
        paddingTop: 30,
    },
    paddedContainer: {
        flex: 1,
        paddingHorizontal: 25,
        paddingTop: 30,
    },
    paddedHorizontal: {
        paddingHorizontal: 25,
    },
    padded: {
        padding: 10,
    },
    input: {
        height: 50,
        borderColor: Colors.borderDark,
        borderWidth: 2,
        marginBottom: 20,
        padding: 10,
    },
    multilineInput: {
        height: 200,
        borderColor: Colors.borderDark,
        borderWidth: 2,
        marginBottom: 20,
        padding: 10,
        textAlignVertical: 'top',
    },
    centered: {
        alignItems: 'center',
    },
    header: {
        paddingVertical: 10,
        backgroundColor: Colors.primary,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
    },
    gapped: {
        gap: 20,
    },
    smallGapped: {
        gap: 10,
    },
    row: {
        flexDirection: 'row',
    },
    justifiedRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    wrapRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    }
})

export default CommonStyles;
