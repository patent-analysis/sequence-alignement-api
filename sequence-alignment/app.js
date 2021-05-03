// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const clustalOmega = require('./clustalOmega.js');
const OUTPUT_TYPE = 'fasta';
const CLUSTAL_DIR_PATH = '';
let error = '';
let is_seq_arr = [];

const build_fasta_string = (sequences) => {
    let seqNumber = 1;
    let fasta_str = '';
    for (let i = 0; i < sequences.length; i++) {
        const sequence = sequences[i];
        if (sequence.seqs) {
            for (let j = 0; j < sequence.seqs.length; j++) {
                const seq = sequence.seqs[j];
                let seqValue = seq.value;
                if (seq.value) {
                    if (Array.isArray(seq.value)) {
                        is_seq_arr.push(true);
                        seqValue = seqValue.join('');
                    } else {
                        is_seq_arr.push(false);
                    }
                    fasta_str += `>seq${seqNumber}\n`;
                    fasta_str += seqValue + '\n';
                    seqNumber++;
                }
            }
        }
    }
    return fasta_str.trimRight();
}

const remap_residues = (old_residues, new_seq) => {
    const residues = [];
    let old_residues_ptr = 0;
    let seq_pos = 1;
    for (let i = 0; i < new_seq.length; i++) {
        if (new_seq[i] === '-') {
            continue;
        }
        if (seq_pos === old_residues[old_residues_ptr]) {
            residues.push(i + 1);
            old_residues_ptr++;
            if (old_residues_ptr >= old_residues.length) {
                break;
            }
        }
        seq_pos++;
    }
    return residues.map(r => r.toString());
}

const extract_seq_from_fasta = (sequences, fasta_str) => {
    console.info("extract_seq_from_fasta.fasta_str", fasta_str);
    const fasta_arr = fasta_str.replace(/\s+/g, '').split(/>seq\d+/);
    console.info("extract_seq_from_fasta.fasta_arr", fasta_arr);
    const fasta_arr_clean = [];
    let fasta_arr_clean_ptr = 0;
    for (let i = 0; i < fasta_arr.length; i++) {
        if (fasta_arr[i] === '') {
            continue;
        }
        fasta_arr_clean.push(fasta_arr[i]);
    }
    console.info("extract_seq_from_fasta.fasta_arr_clean", fasta_arr_clean);
    for (let i = 0; i < sequences.length; i++) {
        const sequence = sequences[i];
        if (sequence.seqs) {
            for (let j = 0; j < sequence.seqs.length; j++) {
                const seq = sequence.seqs[j];
                if (seq.value) {
                    if (seq.claimedResidues) {
                        const old_residues = seq.claimedResidues.map(r => parseInt(r)).sort((a, b) => a-b);
                        console.info("fasta_arr_clean[fasta_arr_clean_ptr] before remapping", fasta_arr_clean[fasta_arr_clean_ptr]);
                        const new_residues = remap_residues(old_residues, fasta_arr_clean[fasta_arr_clean_ptr]);
                        console.info("fasta_arr_clean[fasta_arr_clean_ptr] after remapping", fasta_arr_clean[fasta_arr_clean_ptr]);
                        seq.claimedResidues = new_residues;
                    }
                    let seqValue = fasta_arr_clean[fasta_arr_clean_ptr];
                    if (is_seq_arr[fasta_arr_clean_ptr]) {
                        seqValue = seqValue.split('');
                    }
                    seq.value = seqValue;
                    fasta_arr_clean_ptr++;
                }
            }
        }
    }
}


const align_sequences = async (sequences) => {
    clustalOmega.setCustomLocation(CLUSTAL_DIR_PATH);        
    if (sequences) {
        let fasta_str = build_fasta_string(sequences);
        console.info("fasta_str", fasta_str);
        const retString = clustalOmega.alignSeqString(fasta_str, OUTPUT_TYPE);
        console.info("retString", retString);
        if (retString.startsWith('Error')) {
            error = retString;
        } else {
            extract_seq_from_fasta(sequences, retString);
        }
        
    } else {
        console.error('No sequences found!');
    }
}

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
exports.lambdaHandler = async (event, context) => {
    try {
        // const ret = await axios(url);
        let body = event.body;
        if (typeof(body) === "string") {
            body = JSON.parse(body);
        }
        is_seq_arr = [];
        await align_sequences(body);
        let resp = '';
        let status = 200;
        if (error) {
            resp = error;
            status = 500;
        } else {
            resp = body;
        }
        response = {
            'statusCode': status,
            'headers': {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            'body': JSON.stringify({
                message: resp,
            })
        }
        console.log("response", response);
    } catch (err) {
        response = {
            'statusCode': 500,
            'headers': {
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
            },
            'body': JSON.stringify({
                message: "really bad error " + err,
            })
        }
        console.log(err);
    }

    return response
};
