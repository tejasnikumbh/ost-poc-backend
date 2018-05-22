const baseUrl = "https://sandboxapi.ost.com";
const companyUuid = "2f879999-d3a2-4336-ad34-79a7dc693ac3";

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
  requestGrantTransaction,
  competitionStakeTransaction,
  cRTransactionStageOne,
  cRTransactionStageTwo,
  cRTransactionStageThree,
  cRTransactionStageFour
}
