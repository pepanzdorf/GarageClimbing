import { BoulderType } from "@/types/boulderType";
import { Alert } from "react-native";

export const gradeIdToGradeName = (gradeId: number, grading: number) : string => {
    if (gradeId == -1) {
        return "Open"
    }
    if (grading == 0) {
        const gradeNumber = Math.floor(gradeId / 3);
        const gradeSign = gradeId % 3;
        const gradeSigns = ['-', '', '+'];
        return 'V' + gradeNumber + gradeSigns[gradeSign];
    } else if (grading == 1) {
        return fontDict[gradeId];
    } else if (grading == 2) {
        return YDSDict[gradeId];
    } else if (grading == 3) {
        return frenchSportDict[gradeId];
    } else if (grading == 4) {
        if (gradeId == 52) return "Těžší";
        return "Easy"
    } else {
        return "Unknown"
    }
}

export const ferrataGradeIdToGradeName = (gradeId: number) => {
    return (gradeId >= 0 && gradeId <= 5 ? String.fromCharCode(65 + gradeId) : '-');
}


export const crackIdToCrackName = (crackId: number) => {
    switch(crackId){
        case 0:
            return "-";
        case 1:
            return "Dlaň";
        case 2:
            return "Pěst";
        case 3:
            return "Komín";
        case 4:
            return "Prsty";
        case 5:
            return "Off-width";
    }
}

export const sortBoulderBy = (sorter: number, boulders: BoulderType[]) => {
    if(sorter == 1){
        return [...boulders].sort((a, b) => b.average_grade - a.average_grade);
    } else if(sorter == 2){
        return [...boulders].sort((a,b) => a.name.localeCompare(b.name));
    } else if(sorter == 3){
        return [...boulders].sort((a,b) => a.average_grade - b.average_grade);
    } else if(sorter == 4){
        return [...boulders].sort((a,b) => b.name.localeCompare(a.name));
    } else if(sorter == 5){
        return [...boulders].sort((a,b) => b.build_time - a.build_time);
    } else if(sorter == 6){
        return [...boulders].sort((a,b) => a.build_time - b.build_time);
    } else if(sorter == 7){
        return [...boulders].sort((a,b) => b.average_rating - a.average_rating);
    } else if(sorter == 8){
        return [...boulders].sort((a,b) => a.average_rating - b.average_rating);
    } else if(sorter == 9) {
        return shuffle([...boulders]);
    } else {
        return [...boulders];
    }
}


const shuffle = (array: BoulderType[]) => {
    let currentIndex = array.length;
    let newArray = [...array];

    while (currentIndex != 0) {
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        let temporaryValue = newArray[currentIndex];
        newArray[currentIndex] = newArray[randomIndex];
        newArray[randomIndex] = temporaryValue;
    }
    return newArray;
}


export const stringToSeed = (str: string) =>
  Math.abs([...str].reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0));


export const filterBoulders = (
    boulders: BoulderType[],
    withOpen: boolean,
    lowerGrade: number,
    upperGrade: number,
    sent: boolean,
    favourite: boolean,
    tags: number[],
    sentSeasonal: boolean
) => {
    return boulders.filter(boulder => {
        const boulderGrade = boulder.average_grade;
        let hasAllTags = true;
        if (boulder.tags && tags.length > 0) {
            tags.forEach(tag => {
                if (!boulder.tags.includes(tag)) {
                    hasAllTags = false;
                }
            });
        }
        return ((boulderGrade >= lowerGrade && boulderGrade <= upperGrade) || (withOpen && boulderGrade === -1))
            && (!sent || !boulder.sent)
            && (!sentSeasonal || !boulder.sent_season)
            && (!favourite || boulder.favourite)
            && hasAllTags;
    });
}

export const filterBySearch = (boulders: BoulderType[], search: string) => {
    return boulders.filter(boulder => boulder.name.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(" ", "").includes(search.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "").replace(" ", "")));
}

export const findBoulderById = (id: number, boulders: BoulderType[]) => {
    for (let i = 0; i < boulders.length; i++) {
        if (boulders[i].id === id) {
            return boulders[i];
        }
    }
}

export const attemptIdToAttemptName = (attemptId: number) => {
    if (attemptId === -1) return "-";
    if (attemptId === 0) return "Flash";
    if (attemptId === 9) return "10-24";
    if (attemptId === 10) return "25+";
    return attemptId+1;
}

export const mulberry32 = (seed: number) => {
    return function () {
        seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}


export const calculateBoulderScore = (grade: number, attempts: number, score: number) => {
    let penalty = 0;
    if (2 > attempts && attempts > 0) {
        penalty = 2;
    } else if (6 > attempts && attempts >= 2) {
        penalty = 3;
    } else if (9 > attempts && attempts >= 6) {
        penalty = 4;
    } else if (attempts >= 9) {
        penalty = 5;
    }

    let multiplier = Math.floor(grade / 3) + 1

    return Math.max(Math.floor(((grade + 1) * multiplier * 3) * score - penalty), 1);
}


export const confirmAction = (
    title: string,
    message: string,
    onConfirm: () => void
) => {
    Alert.alert(
        title,
        message,
        [
            {
                text: "Ano",
                onPress: onConfirm,
            },
            {
                text: "Ne",
                style: "cancel",
            },
        ]
    );
};


export const normalizeName = (value: string) => {
    return value.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}


export const numberToStrokeColor = (num: number) => {
    switch(num){
        case -1:
            return "#FFFFFF";
        case 0:
            return "#ff2900";
        case 1:
            return "#fffb22";
        case 2:
            return "#0089ff";
        case 3:
            return "#4cff00";
        case 4:
            return "none";
    }
}


export const numberToFillColor = (num: number) => {
    switch(num){
        case -1:
            return "none";
        case 0:
            return "none";
        case 1:
            return "none";
        case 2:
            return "none";
        case 3:
            return "none";
        case 4:
            return "url(#hatch)";
    }
}


export const gradeToColor = (grade: number) => {
    switch(grade){
        case 0:
            return "#FF5733";
        case 1:
            return "#33FF57";
        case 2:
            return "#3357FF";
        case 3:
            return "#FF33A1";
        case 4:
            return "#57FF33";
        case 5:
            return "#33A1FF";
        case 6:
            return "#A133FF";
        case 7:
            return "#FF8C33";
        case 8:
            return "#8C33FF";
        case 9:
            return "#33FF8C";
        case 10:
            return "#FF3333";
        case 11:
            return "#33FFB2";
        case 12:
            return "#FF33F0";
        case 13:
            return "#33F0FF";
        case 14:
            return "#FFD733";
        case 15:
            return "#33FFDA";
        case 16:
            return "#FFA133";
        case 17:
            return "#33FFA1";
    }
}


const fontDict: { [key: number]: string } = {
    0: '4-',
    1: '4',
    2: '4+',
    3: '5',
    4: '5',
    5: '5',
    6: '5+',
    7: '5+',
    8: '5+',
    9: '6A',
    10: '6A',
    11: '6A+',
    12: '6B',
    13: '6B',
    14: '6B+',
    15: '6C',
    16: '6C',
    17: '6C+',
    18: '7A',
    19: '7A',
    20: '7A',
    21: '7A+',
    22: '7A+',
    23: '7A+',
    24: '7B',
    25: '7B',
    26: '7B+',
    27: '7C',
    28: '7C',
    29: '7C',
    30: '7C+',
    31: '7C+',
    32: '7C+',
    33: '8A',
    34: '8A',
    35: '8A',
    36: '8A+',
    37: '8A+',
    38: '8A+',
    39: '8B',
    40: '8B',
    41: '8B',
    42: '8B+',
    43: '8B+',
    44: '8B+',
    45: '8C',
    46: '8C',
    47: '8C',
    48: '8C+',
    49: '8C+',
    50: '8C+',
    51: '9A',
    52: '9A'
}

const YDSDict: { [key: number]: string } = {
    0: '5.8',
    1: '5.9',
    2: '5.10a',
    3: '5.10b',
    4: '5.10c',
    5: '5.10d',
    6: '5.10d',
    7: '5.11a',
    8: '5.11b',
    9: '5.11c',
    10: '5.11c',
    11: '5.11d',
    12: '5.12a',
    13: '5.12a',
    14: '5.12a',
    15: '5.12b',
    16: '5.12b',
    17: '5.12b',
    18: '5.12c',
    19: '5.12c',
    20: '5.12c',
    21: '5.12d',
    22: '5.12d',
    23: '5.12d',
    24: '5.13a',
    25: '5.13a',
    26: '5.13b',
    27: '5.13c',
    28: '5.13c',
    29: '5.13c',
    30: '5.13d',
    31: '5.13d',
    32: '5.13d',
    33: '5.14a',
    34: '5.14a',
    35: '5.14a',
    36: '5.14b',
    37: '5.14b',
    38: '5.14b',
    39: '5.14c',
    40: '5.14c',
    41: '5.14c',
    42: '5.14d',
    43: '5.14d',
    44: '5.14d',
    45: '5.15a',
    46: '5.15a',
    47: '5.15a',
    48: '5.15b',
    49: '5.15b',
    50: '5.15b',
    51: '5.15c',
    52: '5.15c'
}

const frenchSportDict: { [key: number]: string } = {
    0: '5c',
    1: '6a',
    2: '6a+',
    3: '6b',
    4: '6b',
    5: '6b+',
    6: '6b+',
    7: '6c',
    8: '6c',
    9: '6c+',
    10: '6c+',
    11: '7a',
    12: '7a',
    13: '7a',
    14: '7a+',
    15: '7a+',
    16: '7b',
    17: '7b',
    18: '7b+',
    19: '7b+',
    20: '7b+',
    21: '7c',
    22: '7c',
    23: '7c',
    24: '7c+',
    25: '8a',
    26: '8a',
    27: '8a+',
    28: '8a+',
    29: '8a+',
    30: '8b',
    31: '8b',
    32: '8b',
    33: '8b+',
    34: '8b+',
    35: '8b+',
    36: '8c',
    37: '8c',
    38: '8c',
    39: '8c+',
    40: '8c+',
    41: '8c+',
    42: '9a',
    43: '9a',
    44: '9a',
    45: '9a+',
    46: '9a+',
    47: '9a+',
    48: '9b',
    49: '9b',
    50: '9b',
    51: '9b+',
    52: '9b+'
}
