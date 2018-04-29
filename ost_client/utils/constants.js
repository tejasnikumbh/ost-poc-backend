const baseUrl = "https://playgroundapi.ost.com";
const companyUuid = "2f879999-d3a2-4336-ad34-79a7dc693ac3";

const competitionStakeTransaction = {
  name: "competitionStake",
  kind: "user_to_company",
  value: 5
};

const competitionRewardTransaction = {
  name: "competitionReward",
  kind: "company_to_user",
  value: 10
};

const learnStakeTransaction = {
  name: "learnStake",
  kind: "user_to_company",
  value: 2
};

const learnRewardTransaction = {
  name: "learnReward",
  kind: "company_to_user",
  value: 1
}

module.exports = {
  baseUrl,
  companyUuid,
  competitionStakeTransaction,
  competitionRewardTransaction,
  learnStakeTransaction,
  learnRewardTransaction
}
