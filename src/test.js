const fs = require('fs');

var contenido = fs.readFileSync('universidades.csv', 'utf-8')

for (var line of contenido.split('\n')) {
    console.log(`Linea: ${line.split(',')}`)
}
