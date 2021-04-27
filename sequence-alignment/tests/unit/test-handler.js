'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var context;
var event = {
    "body": [
        {
            'seq_id': '1',
            'sequence': 'ACDEFGHIKLMNPQRSTVWY'
        },
        {
            'seq_id': '2',
            'sequence': 'XXXXACDEFGHIMNXXXPQR'
        },
        {
            'seq_id': '2',
            'sequence': 'ACDEFGHILMNXXXXXPQRS'
        },
        {
            'seq_id': '1',
            'sequence': 'XXXACDEFGHIKLMNPQRST'
        },
    ]
}

describe('Tests index', function () {
    it('verifies successful response', async () => {
        const result = await app.lambdaHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.message).to.be.equal('["----ACDEFGHIKLM----NPQRSTVWY","XXXXACDEFGHIMNXXXP---QR-----","----ACDEFGHILMNXXXXXPQRS----","-XXXACDEFGHIKLM----NPQRST---"]');
        // expect(response.location).to.be.an("string");
    });
});
