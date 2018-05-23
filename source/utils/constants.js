const baseUrl = "https://sandboxapi.ost.com";
const companyUuid = "2f879999-d3a2-4336-ad34-79a7dc693ac3";
const companyContractAddress = "0x8dc45eDc4882f75403330860Db27746e88C38B7e";
const airdropContractAddress = "0xDa61a8BA13097Bd5D539f4e5ceeE5220A6F99F9E";
const brandedTokenContractAddress = "0x2FC5affb47CF163C7223A3DdA524e9358CaC5f7F";
const requestGrantTransaction = {
  name: "requestGrant",
  kind: "company_to_user",
  value: 1 // set on ost dashboard
}

const competitionStakeTransaction = {
  name: "competitionStake",
  kind: "user_to_company",
  value: 2.5 // set on ost dashboard
};

const cRTransactionStageOne = {
  name: "cRStageOne",
  kind: "company_to_user",
  value: 1 // set on ost dashboard
};

const cRTransactionStageTwo = {
  name: "cRStageTwoNew",
  kind: "company_to_user",
  value: 2 // set on ost dashboard
};

const cRTransactionStageThree = {
  name: "cRStageThree",
  kind: "company_to_user",
  value: 3 // set on ost dashboard
};

const cRTransactionStageFour = {
  name: "cRStageFour",
  kind: "company_to_user",
  value: 5
}

module.exports = {
  baseUrl,
  companyUuid,
  companyContractAddress,
  airdropContractAddress,
  brandedTokenContractAddress,
  requestGrantTransaction,
  competitionStakeTransaction,
  cRTransactionStageOne,
  cRTransactionStageTwo,
  cRTransactionStageThree,
  cRTransactionStageFour
}
