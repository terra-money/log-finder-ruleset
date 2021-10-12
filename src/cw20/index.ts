import { LogFindersActionRuleSet } from "../types"

const rules = {
  provideLiquidityRule: {
    type: "from_contract",
    attributes: [
      ["contract_address"],
      ["action", "provide_liquidity"],
      ["assets"],
      ["share"],
      ["contract_address"],
      ["action"],
      ["from"],
      ["to"],
      ["by"],
      ["amount"],
      ["contract_address"],
      ["action"],
      ["to"],
      ["amount"],
    ],
  },
  provideLiquidityRuleTypeB: {
    type: "from_contract",
    attributes: [
      ["contract_address"],
      ["action", "provide_liquidity"],
      ["sender"],
      ["receiver"],
      ["assets"],
      ["share"],
      ["contract_address"],
      ["action"],
      ["from"],
      ["to"],
      ["by"],
      ["amount"],
      ["contract_address"],
      ["action"],
      ["to"],
      ["amount"],
    ],
  },
  withdrawLiquidityRuleTypeA: {
    type: "from_contract",
    attributes: [
      ["contract_address"],
      ["action", "send"],
      ["from"],
      ["to"],
      ["amount"],
      ["contract_address"],
      ["action", "withdraw_liquidity"],
      ["withdrawn_share"],
      ["refund_assets"],
      ["contract_address"],
      ["action"],
      ["from"],
      ["to"],
      ["amount"],
      ["contract_address"],
      ["action"],
      ["from"],
      ["amount"],
    ],
  },
  withdrawLiquidityRuleTypeB: {
    type: "from_contract",
    attributes: [
      ["contract_address"],
      ["action", "send"],
      ["from"],
      ["to"],
      ["amount"],
      ["contract_address"],
      ["action", "withdraw_liquidity"],
      ["withdrawn_share"],
      ["refund_assets"],
      ["contract_address"],
      ["action"],
      ["from"],
      ["amount"],
    ],
  },
  withdrawLiquidityRuleTypeC: {
    type: "from_contract",
    attributes: [
      ["contract_address"],
      ["action", "send"],
      ["from"],
      ["to"],
      ["amount"],
      ["contract_address"],
      ["action", "withdraw_liquidity"],
      ["sender"],
      ["withdrawn_share"],
      ["refund_assets"],
      ["contract_address"],
      ["action"],
      ["from"],
      ["to"],
      ["amount"],
      ["contract_address"],
      ["action", "burn"],
      ["from"],
      ["amount"],
    ],
  },
  transferRule: {
    type: "from_contract",
    attributes: [
      ["contract_address"],
      ["action", "transfer"],
      ["from"],
      ["to"],
      ["amount"],
    ],
  },
}

const create = () => {
  const provideLiquidityRuleSet: LogFindersActionRuleSet = {
    rule: rules.provideLiquidityRule,
    transform: (fragment, matched) => ({
      msgType: "token/provide-liquidity",
      canonicalMsg: [
        `Provide ${matched[2].value} Liquidity to ${matched[0].value}`,
        `Mint ${matched[13].value}${matched[10].value}`,
      ],
      payload: fragment,
    }),
  }
  const provideLiquidityRuleSetTypeB: LogFindersActionRuleSet = {
    rule: rules.provideLiquidityRuleTypeB,
    transform: (fragment, matched) => ({
      msgType: "token/provide-liquidity",
      canonicalMsg: [
        `Provide ${matched[4].value} Liquidity to ${matched[0].value}`,
        `Mint ${matched[15].value}${matched[12].value}`,
      ],
      payload: fragment,
    }),
  }
  const withdrawLiquidityRuleSetTypeA: LogFindersActionRuleSet = {
    rule: rules.withdrawLiquidityRuleTypeA,
    transform: (fragment, matched) => ({
      msgType: "token/withdraw-liquidity",
      canonicalMsg: [
        `Withdraw ${matched[8].value} Liquidity from ${matched[5].value}`,
        `Burn ${matched[17].value}${matched[14].value}`,
      ],
      payload: fragment,
    }),
  }

  const withdrawLiquidityRuleSetTypeB: LogFindersActionRuleSet = {
    rule: rules.withdrawLiquidityRuleTypeB,
    transform: (fragment, matched) => ({
      msgType: "token/withdraw-liquidity",
      canonicalMsg: [
        `Withdraw ${matched[8].value} Liquidity from ${matched[5].value}`,
        `Burn ${matched[12].value}${matched[9].value}`,
      ],
      payload: fragment,
    }),
  }

  const withdrawLiquidityRuleSetTypeC: LogFindersActionRuleSet = {
    rule: rules.withdrawLiquidityRuleTypeC,
    transform: (fragment, matched) => ({
      msgType: "token/withdraw-liquidity",
      canonicalMsg: [
        `Withdraw ${matched[9].value} Liquidity from ${matched[5].value}`,
        `Burn ${matched[18].value}${matched[15].value}`,
      ],
      payload: fragment,
    }),
  }

  const transferRuleSet: LogFindersActionRuleSet = {
    rule: rules.transferRule,
    transform: (fragment, matched) => ({
      msgType: "token/transfer",
      canonicalMsg: [
        `Transfer ${matched[4].value}${matched[0].value} to ${matched[3].value}`,
      ],
      payload: fragment,
    }),
  }

  return [
    provideLiquidityRuleSet,
    provideLiquidityRuleSetTypeB,
    withdrawLiquidityRuleSetTypeA,
    withdrawLiquidityRuleSetTypeB,
    withdrawLiquidityRuleSetTypeC,
    transferRuleSet,
  ]
}

export default create
