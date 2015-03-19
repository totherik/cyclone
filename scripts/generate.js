import Fs from 'fs';
import Path from 'path';
import Https from 'https';
import Espree from 'espree';
import Child from 'child_process';
import { mkdirpSync as mkdirp, removeSync as rimraf } from 'fs-extra';


// TODO: Detect version of storm installed to determine appropriate thrift file.
const URL = 'https://raw.githubusercontent.com/apache/storm/v0.9.3/storm-core/src/storm.thrift';
const THRIFT = 'scripts/storm.thrift';
const DEST = 'lib/generated';
const PATCH = 'scripts/storm_types.patch';


// Clean up previous runs and create dest dir
console.log(`rm ${THRIFT}`);
rimraf(THRIFT);

console.log(`rm ${DEST}`);
rimraf(DEST);
mkdirp(DEST);


console.log(`get ${URL}`);
Https.get(URL, res => {
    res.pipe(Fs.createWriteStream(THRIFT)).on('finish', () => generate(THRIFT, DEST));
});


// Use thrift to generate JS from the provided thrift file.
function generate(thriftFile, dest) {
    console.log(`gen ${thriftFile}`);

    let child;
    child = Child.spawn('thrift', ['-gen', 'js:node', '-out', dest, thriftFile]);
    child.on('exit', () => rewrite(dest));
}


// Apply `exports` to each file in the directory and then apple the
// provided patch.
function rewrite(dir) {
    eachfile(dir, exports);

    // Applying Map patch
    console.log(`git apply ${PATCH}`);
    Child.spawn('git', [ 'apply', PATCH ], { stdio: [ 'pipe', process.stdout, process.stderr ] });
}


// Simple helper to recursively traverse a directory
// and invoke a fn with each located file.
function eachfile(dir, fn) {

    let files = Fs.readdirSync(dir);

    for (let file of files) {

        let path = Path.join(dir, file);
        let stat = Fs.statSync(path);

        if (stat.isDirectory()) {
            eachfile(path, fn);
        } else {
            fn(path);
        }
    }
}


// Converts the generated thrift JS into valid 'strict'-safe
// JS by adding variable declarations for all top-level assignment
// expressions to the beginning of each file.
function exports(file) {
    let js = Fs.readFileSync(file, 'utf8');
    let ast = Espree.parse(js);
    let identifiers = [];

    for (let { type, expression = {} } of ast.body) {
        if (type === 'ExpressionStatement') {

            let { type: expressionType, left } = expression;
            if (expressionType === 'AssignmentExpression' && left.type === 'Identifier') {
                identifiers.push(left.name);
            }

        }
    }

    console.log(`prepend ${file}`);
    let declarations = `var ${identifiers.join(',\n    ')};\n`;
    Fs.writeFileSync(file, declarations + js);
}