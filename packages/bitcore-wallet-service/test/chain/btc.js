'use strict';

var _ = require('lodash');
var async = require('async');
var chai = require('chai');
var mongodb = require('mongodb');
var should = chai.should();
const { ChainService } = require('../../ts_build/lib/chain');
const { BtcChain } = require('../../ts_build/lib/chain/btc');
const { TxProposal } = require('../../ts_build/lib/model/txproposal');

const Common = require('../../ts_build/lib/common');
const Constants = Common.Constants;



describe('Chain BTC', function() {
 
  describe('#getBitcoreTx', function() {
    it('should create a valid bitcore TX', function() {
      var txp = TxProposal.fromObj(aTXP());
      var t = ChainService.getBitcoreTx(txp);
      should.exist(t);
    });
    it('should order outputs as specified by outputOrder', function() {
      var txp = TxProposal.fromObj(aTXP());

      txp.outputOrder = [0, 1, 2];
      var t = ChainService.getBitcoreTx(txp);
      t.getChangeOutput().should.deep.equal(t.outputs[2]);

      txp.outputOrder = [2, 0, 1];
      var t2 = ChainService.getBitcoreTx(txp);
      t2.getChangeOutput().should.deep.equal(t2.outputs[0]);
    });

    it('should create a valid signed bitcore TX', function() {
      var txp = TxProposal.fromObj(signedTxp);
      var t = ChainService.getBitcoreTx(txp);
      should.exist(t);

      // should serialized
      t.serialize().should.equal('0100000001c05c50d820b4cbb4432af783a0a0b81f50cbf7c890939e713a9f03fb01eb7f4e050000006b483045022100ace0efb22eaf21b77d5e4a31a491ad06fbcfe700ace5abe8453ec0328c714cba02205090a44975d4b65b5e2f4473da038e83875826b369fc79558a741268ed574bb04121024d27ca79a3ed27a143cb9d1dff01e4e6445294679a700ca404ca449211d08aa7ffffffff0282233101000000001976a9149edd2399faccf4e57df08bef78962fa0228741cf88ac00b4c404000000001976a91451224bca38efcaa31d5340917c3f3f713b8b20e488ac00000000');
      t.isFullySigned().should.equal(true);
    });

    it('should create a valid unsigned bitcore TX', function() {
      var txp = TxProposal.fromObj(signedTxp);
      var t = ChainService.getBitcoreTx(txp, {signed: false} );
      should.exist(t);

      // should serialized
      (function () {return t.serialize()}).should.throw('not been fully signed');

      t.uncheckedSerialize().should.equal('0100000001c05c50d820b4cbb4432af783a0a0b81f50cbf7c890939e713a9f03fb01eb7f4e0500000000ffffffff0282233101000000001976a9149edd2399faccf4e57df08bef78962fa0228741cf88ac00b4c404000000001976a91451224bca38efcaa31d5340917c3f3f713b8b20e488ac00000000');
      t.isFullySigned().should.equal(false);
    });
 
 
  });


  describe.only('#getEstimatedSize', function() {

    let btc;
    before(function()  {
      btc = new BtcChain();
    });
    it('1  input p2sh, 2 P2PKH outputs:  ', function() {
      let x = TxProposal.fromObj(aTXP());
      btc.getEstimatedSize(x).should.equal(326);
    });

    it('1  input p2sh, 3 P2PKH outputs:  ', function() {
      let x = TxProposal.fromObj(aTXP());
      x.outputs[2] = _.clone(x.outputs[1]);
      btc.getEstimatedSize(x).should.equal(352);
    });

    it('2  input p2sh, 2 P2PKH outputs:  ', function() {
      let x = TxProposal.fromObj(aTXP());
      x.inputs[1] = _.clone(x.inputs[0]);
      btc.getEstimatedSize(x).should.equal(592);
    });

   it('2  input p2sh, 2 Native Segwit outputs:  ', function() {
      let x = TxProposal.fromObj(aTXP());
      x.outputs[0].toAddress = x.outputs[1].toAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
      btc.getEstimatedSize(x).should.equal(345);
    });

   it('2  input p2pkh, 2 Native Segwit outputs:  ', function() {
      let x = TxProposal.fromObj(aTXP());
       x.addressType =   Constants.SCRIPT_TYPES.P2WPKH;
      x.outputs[0].toAddress = x.outputs[1].toAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
      btc.getEstimatedSize(x).should.equal(230);
    });
 
 
   it('2  input P2WSH, 2 Native Segwit outputs:  ', function() {
      let x = TxProposal.fromObj(aTXP());
       x.addressType =   Constants.SCRIPT_TYPES.P2WSH;
      x.outputs[0].toAddress = x.outputs[1].toAddress = 'bc1qar0srrr7xfkvy5l643lydnw9re59gtzzwf5mdq';
      btc.getEstimatedSize(x).should.equal(176);
    });

 
   it('2  input P2WPKH, 2 p2sh outputs:  ', function() {
      let x = TxProposal.fromObj(aTXP());
       x.addressType =   Constants.SCRIPT_TYPES.P2WPKH;
      x.outputs[0].toAddress = x.outputs[1].toAddress = '3CauZ5JUFfmSAx2yANvCRoNXccZ3YSUjXH';
      btc.getEstimatedSize(x).should.equal(207);
    });
  

  
  });


});

var aTXP = function() {
  var txp = {
    "version": 3,
    "createdOn": 1423146231,
    "id": "75c34f49-1ed6-255f-e9fd-0c71ae75ed1e",
    "walletId": "1",
    "creatorId": "1",
    "network": "livenet",
    "amount": 30000000,
    "message": 'some message',
    "proposalSignature": '7035022100896aeb8db75fec22fddb5facf791927a996eb3aee23ee6deaa15471ea46047de02204c0c33f42a9d3ff93d62738712a8c8a5ecd21b45393fdd144e7b01b5a186f1f9',
    "changeAddress": {
      "version": '1.0.0',
      "createdOn": 1424372337,
      "address": '3CauZ5JUFfmSAx2yANvCRoNXccZ3YSUjXH',
      "path": 'm/2147483647/1/0',
      "publicKeys": ['030562cb099e6043dc499eb359dd97c9d500a3586498e4bcf0228a178cc20e6f16',
        '0367027d17dbdfc27b5e31f8ed70e14d47949f0fa392261e977db0851c8b0d6fac',
        '0315ae1e8aa866794ae603389fb2b8549153ebf04e7cdf74501dadde5c75ddad11'
      ]
    },
    "inputs": [{
      "txid": "6ee699846d2d6605f96d20c7cc8230382e5da43342adb11b499bbe73709f06ab",
      "vout": 8,
      "satoshis": 100000000,
      "scriptPubKey": "a914a8a9648754fbda1b6c208ac9d4e252075447f36887",
      "address": "3H4pNP6J4PW4NnvdrTg37VvZ7h2QWuAwtA",
      "path": "m/2147483647/0/1",
      "publicKeys": ["0319008ffe1b3e208f5ebed8f46495c056763f87b07930a7027a92ee477fb0cb0f", "03b5f035af8be40d0db5abb306b7754949ab39032cf99ad177691753b37d101301"]
    }],
    "inputPaths": ["m/2147483647/0/1"],
    "requiredSignatures": 2,
    "requiredRejections": 1,
    "walletN": 2,
    "addressType": "P2SH",
    "status": "pending",
    "actions": [],
    "fee": 10000,
    "outputs": [{
      "toAddress": "18PzpUFkFZE8zKWUPvfykkTxmB9oMR8qP7",
      "amount": 10000000,
      "message": "first message"
    }, {
      "toAddress": "18PzpUFkFZE8zKWUPvfykkTxmB9oMR8qP7",
      "amount": 20000000,
      "message": "second message"
    }, ],
    "outputOrder": [0, 1, 2]
  };

  return txp;
};

const signedTxp = {"actions":[{"version":"1.0.0","createdOn":1588099987,"copayerId":"671fee02a6c1c4de2e2609f9f9a6180dc03acfff6b759fe0b13a616ed4880065","type":"accept","signatures":["3045022100ace0efb22eaf21b77d5e4a31a491ad06fbcfe700ace5abe8453ec0328c714cba02205090a44975d4b65b5e2f4473da038e83875826b369fc79558a741268ed574bb0"],"xpub":"xpub6DVmxcjRgZdHNSEcXSiFtweVwMSTc3TMwRJ45nJYvyqvLbK1poPerupqh87rSoz27wvckb1CKnGZoLmLXSZyNGZtVd7neqSvdwJL6fceQpe","comment":null}],"version":3,"createdOn":1588099987,"id":"7cea0d95-3308-48e7-a4be-3f16d66e1f5a","walletId":"7eaf4d32-c2fd-4262-864a-4c42fc9236f8","creatorId":"671fee02a6c1c4de2e2609f9f9a6180dc03acfff6b759fe0b13a616ed4880065","coin":"bch","network":"livenet","outputs":[{"amount":80000000,"toAddress":"CPrtPWbp8cCftTQu5fzuLG5zPJNDHMMf8X"}],"amount":80000000,"message":"some message","payProUrl":null,"changeAddress":{"version":"1.0.0","createdOn":1588099987,"address":"CWwtFMy3GMr5qMEtvEdUDjePfShzkJXCnh","walletId":"7eaf4d32-c2fd-4262-864a-4c42fc9236f8","isChange":true,"path":"m/1/0","publicKeys":["02129acdcc600694b3ce55a2d05244186e806174eb0bafde20e5a6395ded647857"],"coin":"bch","network":"livenet","type":"P2PKH","hasActivity":null,"beRegistered":null},"inputs":[{"txid":"4e7feb01fb039f3a719e9390c8f7cb501fb8a0a083f72a43b4cbb420d8505cc0","vout":5,"satoshis":100000000,"scriptPubKey":"76a914d391e62337ed194a1e428f32d14838e5d848180a88ac","address":"qrfere3rxlk3jjs7g28n952g8rjasjqcpgx3axq70t","confirmations":44,"publicKeys":["024d27ca79a3ed27a143cb9d1dff01e4e6445294679a700ca404ca449211d08aa7"],"wallet":"7eaf4d32-c2fd-4262-864a-4c42fc9236f8","path":"m/0/1"}],"walletM":1,"walletN":1,"requiredSignatures":1,"requiredRejections":1,"status":"accepted","txid":"8541ed35ac43e07e362a00ebab9448eefa63840c75ca38edff6785c223503a29","broadcastedOn":null,"inputPaths":["m/0/1"],"outputOrder":[1,0],"fee":2430,"feeLevel":null,"feePerKb":10000,"excludeUnconfirmedUtxos":false,"addressType":"P2PKH","customData":null,"proposalSignature":"3045022100e8a1ac6eef882fb3e7311c725093317df99e5ed46f52fdee9064560bb757d1c902200b09f806a17d4c7950097b8714293725ce741c6de25914f81a8ca0ca1107fc4c","signingMethod":"ecdsa","proposalSignaturePubKey":null,"proposalSignaturePubKeySig":null,"lockUntilBlockHeight":null,"gasPrice":null,"from":null,"nonce":null,"gasLimit":null,"data":null,"tokenAddress":null,"destinationTag":null,"invoiceID":null,"derivationStrategy":"BIP44","creatorName":"copayer 1","raw":"0100000001c05c50d820b4cbb4432af783a0a0b81f50cbf7c890939e713a9f03fb01eb7f4e050000006b483045022100ace0efb22eaf21b77d5e4a31a491ad06fbcfe700ace5abe8453ec0328c714cba02205090a44975d4b65b5e2f4473da038e83875826b369fc79558a741268ed574bb04121024d27ca79a3ed27a143cb9d1dff01e4e6445294679a700ca404ca449211d08aa7ffffffff0282233101000000001976a9149edd2399faccf4e57df08bef78962fa0228741cf88ac00b4c404000000001976a91451224bca38efcaa31d5340917c3f3f713b8b20e488ac00000000","isPending":true} ;
