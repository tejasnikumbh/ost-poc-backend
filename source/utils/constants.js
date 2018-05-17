const baseUrl = "https://playgroundapi.ost.com";
const companyUuid = "2f879999-d3a2-4336-ad34-79a7dc693ac3";

const competitionStakeTransaction = {
  name: "competitionStake",
  kind: "user_to_company",
  value: 1 // set on ost dashboard
};

const competitionRewardTransaction = {
  name: "competitionReward",
  kind: "company_to_user",
  value: 1 // set on ost dashboard
};

const learnStakeTransaction = {
  name: "learnStake",
  kind: "user_to_company",
  value: 10 // set on ost dashboard
};

const learnRewardTransaction = {
  name: "learnReward",
  kind: "company_to_user",
  value: 10 // set on ost dashboard
}

const requestGrantTransaction = {
  name: "requestGrant",
  kind: "company_to_user",
  value: 10 // set on ost dashboard
}

module.exports = {
  baseUrl,
  companyUuid,
  competitionStakeTransaction,
  competitionRewardTransaction,
  learnStakeTransaction,
  learnRewardTransaction,
  requestGrantTransaction
}
