export const gradeIdToGradeName = (gradeId) => {
    if (gradeId === -1) {
        return "Open"
    }
    const gradeNumber = Math.floor(gradeId / 3);
    const gradeSign = gradeId % 3;
    const gradeSigns = ['-', '', '+'];
    return 'V' + gradeNumber + gradeSigns[gradeSign];
}

export const sortBoulderBy = (sorter, boulders) => {
    if(sorter == 1){
        return boulders.sort((a,b) => b.average_grade - a.average_grade);
    } else if(sorter == 2){
        return boulders.sort((a,b) => a.name.localeCompare(b.name));
    } else if(sorter == 3){
        return boulders.sort((a,b) => a.average_grade - b.average_grade);
    } else if(sorter == 4){
        return boulders.sort((a,b) => b.name.localeCompare(a.name));
    } else if(sorter == 5){
        return boulders.sort((a,b) => b.build_time - a.build_time);
    } else if(sorter == 6){
        return boulders.sort((a,b) => a.build_time - b.build_time);
    } else {
        return boulders;
    }
}

export const filterBoulders = (boulders, withOpen, lowerGrade, upperGrade) => {
    const chosenBoulders = boulders.filter(boulder => {
            const boulderGrade = boulder.average_grade;
            return (boulderGrade >= lowerGrade && boulderGrade <= upperGrade) || (withOpen && boulderGrade === -1);
        });
    return chosenBoulders;
}

export const attemptIdToAttemptName = (attemptId) => {
    if (attemptId === 0) return "Flash";
    if (attemptId === 10) return "10-24";
    if (attemptId === 11) return "25+";
    return attemptId;
}