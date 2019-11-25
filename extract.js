const provider = require('./src/provider');
const fs = require('fs');

provider.readUniversityFile().then(data => {
    console.log('Creating autonomies file...');
    const autonomies = provider.filterAutonomies(data);
    fs.writeFileSync('autonomies.txt', autonomies.join('\n'));
    console.log('Successfully updated autonomies file');
    console.log('Autonomies:', autonomies);

    console.log('Creating universities file...');
    const universities = provider.filterUniversities(data);
    fs.writeFileSync('universities.txt', universities.join('\n'));
    console.log('Successfully updated universities file');
    console.log('Universities:', universities);

    console.log('Listing universities per autonomy');
    autonomies.forEach(autonomy => {
        const autonomyUniversities = provider.filterAutonomyUniversities(data, autonomy);

        console.log('Universities in %s (%d): %s\n',
            autonomy, autonomyUniversities.length,
            JSON.stringify(autonomyUniversities)
        )
    })
});
