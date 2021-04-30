'use strict';

const event = require('../../../events/event.json');
const app = require('../../app.js');

const chai = require('chai');
const expect = chai.expect;
var context;

describe('Tests index', function () {
    it('verifies successful response', async () => {
        const result = app.lambdaHandler(event, context)

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.message).to.be.equal('[{\"docId\":\"US99485858\",\"seqs\":[{\"seqId\":6,\"claimedResidues\":\"5, 12, 16, 20\",\"value\":\"----ACDEFGHIKLMN-PQRSTVWY\"},{\"seqId\":7,\"claimedResidues\":\"1, 2, 3, 4\",\"value\":\"XXXXACDEFGHIMNXXXPQR-----\"}]},{\"docId\":\"111111111\",\"seqs\":[{\"seqId\":6,\"claimedResidues\":\"1, 2, 3, 4\",\"value\":\"\"},{\"seqId\":7,\"claimedResidues\":\"\",\"value\":\"-XXXACDEFGHIKLMN-PQRST---\"}]}]');
        // expect(response.location).to.be.an("string");
    });
});
