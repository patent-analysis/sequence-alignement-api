// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const clustalOmega = require('clustal-omega-wrapper');
const OUTPUT_TYPE = 'fasta';
const CLUSTAL_DIR_PATH = './';


const align_sequences = (sequences) => {
    clustalOmega.setCustomLocation(CLUSTAL_DIR_PATH);
    let seqNumber = 1;
    let fasta_str = '';
    const alignedSequences = [];
    if (sequences) {
        for (let i = 0; i < sequences.length; i++) {
            const sequence = sequences[i];
            if (sequence.sequence && sequence.sequence.length > 0) {
                fasta_str += `>seq${seqNumber}\n`;
                fasta_str += `${sequence.sequence}\n`;
            }
            seqNumber++;
        }
        fasta_str.trimRight();
        clustalOmega.alignSeqString(fasta_str,OUTPUT_TYPE,function(err,data){
            if(err){
                console.error(err);
            }else{
                alignedSequences.push(err);
                const fasta_arr = data.split('\n');
                for (let i = 0; i < fasta_arr.length; i++) {
                    if (fasta_arr[i].length <= 0 || fasta_arr[i].startsWith('>seq')) {
                        continue;
                    }
                    alignedSequences.push(fasta_arr[i]);
                }
                console.error("alignedSequences: ", alignedSequences);
            }
        });
    } else {
        console.error('No sequences found!');
    }
    return alignedSequences;
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
        console.error("event.body", event.body);
        const resp = align_sequences(event.body);
        console.error("resp", resp);
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: resp,
                // location: ret.data.trim()
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response
};
