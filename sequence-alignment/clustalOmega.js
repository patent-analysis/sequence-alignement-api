const child_process =  require('child_process');
const fs = require('fs');
const path = require('path');
const uuidv4 = require('uuid/v4');


const clustalOmega = {
    execLocation: path.resolve(path.join(__dirname,'/')),
    customExecLocation: null
};

/*
set a custom location where Clustal Omega binary is located
 */
clustalOmega.setCustomLocation = (location )=> {
    const binPath = `clustalo`;
    if (fs.existsSync(binPath)) {
        clustalOmega.customExecLocation = path.resolve(location);
        console.log(`Custom execution path is set to ${path.resolve(location)}`);
    } else {
        console.log(`${binPath} does not exist. \nPlease check whether the Clustal Omega binary file is located in the given path with the name 'clustalo'.`);
    }
};

/*
Align an unaligned input string of sequences of FASTA format and get output in accepted format
 */
clustalOmega.alignSeqString = (input, outputFormat) => {
    return alignStringSequences(input, outputFormat);
};

function alignStringSequences(input, outputFormat) {
    const tempInputFile = `${__dirname}/${uuidv4()}.fasta`;
    fs.writeFileSync(tempInputFile, input);
    const clustalCommand = `-i ${path.resolve(tempInputFile)} --outfmt=${outputFormat}`;
    return run(clustalCommand);
}

function run(command) {
    let fullCommand = '';
    if ( clustalOmega.customExecLocation != null){
        if (fs.existsSync(`${clustalOmega.customExecLocation}/clustalo`)) {
            fullCommand = `${clustalOmega.customExecLocation}/clustalo ${command}`;
            console.info("File exists");
        }
        
    }else {
        if (fs.existsSync(`${clustalOmega.customExecLocation}/clustalo`)) {
            console.info("File exists");
        fullCommand = `${clustalOmega.execLocation}/clustalo ${command}`;
        }
        
    }
    console.log('RUNNING', fullCommand);
    //const c_process = child_process.exec(fullCommand, {maxBuffer: 1024 * 1000}, callback);
    let result = null;
    try {
        result = child_process.execSync(fullCommand).toString();
    } catch (error) {
        result = `Error - status code: ${error.status}, message: ${error.message}`;
    }

    return result;
}


module.exports = clustalOmega;