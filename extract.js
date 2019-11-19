const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const inputUniversityFile = path.resolve(__dirname, 'universities.csv'); 
const outputUniversityFile = path.resolve(__dirname, 'src/universities.json'); 

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
        .filter((elem, pos, self) => self.indexOf(elem) == pos)
}

function filterUniversities(universityList) {
    return universityList
        .map((university) => university["Universidad"])
}

readUniversityFile().then(data => {
    console.log('Converting csv to json');
    fs.writeFileSync(outputUniversityFile, JSON.stringify(data));
    console.log('Successfully converted csv to json');

    console.log('Creating autonomies file...');
    const autonomies = filterAutonomies(data);
    fs.writeFileSync('autonomies.txt', autonomies.join('\n'));
    console.log('Successfully updated autonomies file');

    console.log('Creating universities file...');
    const universities = filterUniversities(data);
    fs.writeFileSync('universities.txt', universities.join('\n'));
    console.log('Successfully updated universities file');
})