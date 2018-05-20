const airdrop = require('./../ost-airdrop');

function dropTokensToAll(amount) {
  airdrop.dropTokens(amount, 'all');
}

function dropTokensToNeverAirdropped(amount) {
  airdrop.dropTokens(amount, 'never_airdropped');
}

//dropTokensToNeverAirdropped(1);
dropTokensToAll(1);
