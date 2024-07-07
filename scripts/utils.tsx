export const gradeIdToGradeName = (gradeId) => {
    if (gradeId === -1) {
        return "Open"
    }
    const gradeNumber = Math.floor(gradeId / 3);
    const gradeSign = gradeId % 3;
    const gradeSigns = ['-', '', '+'];
    return 'V' + gradeNumber + gradeSigns[gradeSign];
}