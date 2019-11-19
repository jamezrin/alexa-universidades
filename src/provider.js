const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const inputUniversityFile = path.resolve(__dirname, 'universities.csv'); 

function readUniversityFile() {
    return new Promise((resolve, reject) => {
        const universityObjList = [];
        fs.createReadStream(inputUniversityFile)
            .pipe(csv())
            .on('data', function(data) {
                universityObjList.push(data);
            })
            .on('end', function() {
                resolve(universityObjList)
            })
            .on('err', function(err) {
                reject(err)
            }); 
    });
}

function filterAutonomies(universityList) {
    return universityList
        .map((university) => university["Comunidad autónoma"])
        .filter((elem, pos, self) => self.indexOf(elem) === pos)
}

function filterUniversities(universityList) {
    return universityList
        .map((university) => university["Universidad"])
}

function filterAutonomyUniversities(universityList, autonomy) {
    return universityList
        .filter((elem, pos) => elem["Comunidad autónoma"] === autonomy)
}

function findUniversity(universityList, universityName) {
    return universityList
        .find((elem) => elem["Universidad"] === universityName);
}

module.exports = { 
    readUniversityFile,
    filterAutonomies,
    filterUniversities,
    filterAutonomyUniversities,
    findUniversity
}