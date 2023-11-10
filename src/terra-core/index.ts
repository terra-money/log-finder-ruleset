import { LogFindersActionRuleSet } from "../types"
import { attachDenom } from "../utility"

const rules = {
  msgSendRule: {
    type: "transfer",
    attributes: [["recipient"], ["sender"], ["amount"]],
  },
  msgWithdrawDelegationRewardRule: {
    type: "withdraw_rewards",
    attributes: [["amount"], ["validator"]],
  },
  msgVoteRule: {
    type: "proposal_vote",
    attributes: [["option"], ["proposal_id"]],
  },
  msgSubmitProposalRule: {
    type: "submit_proposal",
    attributes: [["proposal_id"], ["proposal_type"], ["voting_period_start"]],
  },
  msgDepositRule: {
    type: "proposal_deposit",
    attributes: [["amount"], ["proposal_id"]],
  },
  msgSwapRule: {
    type: "swap",
    attributes: [
      ["offer"],
      ["trader"],
      ["recipient"],
      ["swap_coin"],
      ["swap_fee"],
    ],
  },
  msgTerraSwapRule: {
    type: "from_contract",
    attributes: [
      ["offer_asset"],
      ["ask_asset"],
      ["offer_amount"],
      ["return_amount"],
      ["tax_amount"],
      ["spread_amount"],
      ["commission_amount"],
    ],
  },
  wasmTerraSwapRule: {
    type: "wasm",
    attributes: [
      ["offer_asset"],
      ["ask_asset"],
      ["offer_amount"],
      ["return_amount"],
      ["tax_amount"],
      ["spread_amount"],
      ["commission_amount"],
    ],
  },
  msgExchangeRateVoteRule: {
    type: "vote",
    attributes: [["denom"], ["voter"], ["exchange_rate"], ["feeder"]],
  },
  msgExchangeRatePrevoteRule: {
    type: "prevote",
    attributes: [["denom"], ["voter"], ["feeder"]],
  },
  msgAggregateExchangeRateVoteRule: {
    type: "aggregate_vote",
    attributes: [["voter"], ["exchange_rates"], ["feeder"]],
  },
  msgAggregateExchangeRatePrevoteRule: {
    type: "aggregate_prevote",
    attributes: [["voter"], ["feeder"]],
  },
  msgUnjailRule: {
    type: "message",
    attributes: [["action", "unjail"], ["module", "slashing"], ["sender"]],
  },
  msgUndelegateRule: {
    type: "unbond",
    attributes: [["validator"], ["amount"], ["completion_time"]],
  },
  msgEditValidatorRule: {
    type: "message",
    attributes: [
      ["action", "edit_validator"],
      ["module", "staking"],
      ["sender"],
    ],
  },
  msgDelegateRule: {
    type: "delegate",
    attributes: [["validator"], ["amount"]],
  },
  msgCreateValidatorRule: {
    type: "create_validator",
    attributes: [["validator"], ["amount"]],
  },
  msgBeginRedelegateRule: {
    type: "redelegate",
    attributes: [
      ["source_validator"],
      ["destination_validator"],
      ["amount"],
      ["completion_time"],
    ],
  },
  msgStoreCodeRule: {
    type: "store_code",
    attributes: [["sender"], ["code_id"]],
  },
  msgMigrateContractRule: {
    type: "migrate_contract",
    attributes: [["code_id"], ["contract_address"]],
  },
  msgInstantiateContractRule: {
    type: "instantiate_contract",
    attributes: [["owner"], ["code_id"], ["contract_address"]],
  },
  msgMultiSendRule: {
    type: "transfer",
    attributes: [["recipient"], ["amount"]],
  },
  msgGrantAuthorization: {
    type: "grant_authorization",
    attributes: [["grant_type"], ["granter"], ["grantee"]],
  },
}

const showVoteOption = (string: string) => {
  const voteOptions = {
    VOTE_OPTION_YES: "Yes",
    VOTE_OPTION_ABSTAIN: "Abstain",
    VOTE_OPTION_NO: "No",
    VOTE_OPTION_NO_WITH_VETO: "No With Veto"
  }

  // Extract vote option and weight from provided string.
  const regex = new RegExp(/^{?"?option"?:([A-Z_|\d]*?)[,\s]"?weight"?:"?([\d\.]*)/)
  const matches = string.match(regex)

  try {
    if (matches && matches[1] && parseFloat(matches[2])) {
      if (parseInt(matches[1])) {
        // If option returned is an integer, get corresponding vote option string.
        const option = parseInt(matches[1])
        return {
          voteType: voteOptions[Object.keys(voteOptions)[option - 1] as keyof typeof voteOptions],
          weight: parseFloat(matches[2]).toFixed(1)
        }
      } else {
        // If option is a string, the value should correspond to a key of voteOptions.
        return {
          voteType: voteOptions[matches[1] as keyof typeof voteOptions],
          weight: parseFloat(matches[2]).toFixed(1)
        }
      }
    }
  } catch (e) {
    console.error(e)
  }

  return {voteType: string}
}

const create = () => {
  const msgSendRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgSendRule,
    transform: (fragment, matched) => {
      // Evaluate send message based on if the matched address is the user's address.
      let msg
      if (matched[1].value.startsWith('wallet:')) {
        msg = `Sent ${matched[2].value} to ${matched[0].value}`
      } else if (matched[0].value.startsWith('wallet:')) {
        msg = `Received ${matched[2].value} from ${matched[1].value}`
      } else {
        msg = `${matched[1].value} sent ${matched[2].value} to ${matched[0].value}`
      }
      return ({
      msgType: "terra/send",
      canonicalMsg: [
        msg,
      ],
      payload: fragment,
    })
  }}

  const msgWithdrawDelegationRewardRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgWithdrawDelegationRewardRule,
    transform: (fragment, matched) => ({
      msgType: "terra/withdraw-delegation-reward",
      canonicalMsg: [
        matched[0].value
          ? `Withdrew ${matched[0].value} staking rewards from ${matched[1].value}`
          : `Withdrew staking rewards from ${matched[1].value}`,
      ],
      payload: fragment,
    }),
  }

  const msgVoteRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgVoteRule,
    transform: (fragment, matched) => {
      const {voteType, weight} = showVoteOption(matched[0].value)
      const weightString = weight && parseFloat(weight) !== 1 ? ` with weight ${weight}` : ''
      return {
      msgType: "terra/vote",
      canonicalMsg: [
        `Voted ${voteType} on proposal:${matched[1].value}${weightString}`,
      ],
      payload: fragment,
    }
  }}

  const msgSubmitProposalRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgSubmitProposalRule,
    transform: (fragment, matched) => ({
      msgType: "terra/submit-proposal",
      canonicalMsg: [`Created proposal:${matched[0].value}`],
      payload: fragment,
    }),
  }

  const msgDepositRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgDepositRule,
    transform: (fragment, matched) => ({
      msgType: "terra/deposit",
      canonicalMsg: [
        `Deposited ${matched[0].value} to proposal:${matched[1].value}`,
      ],
      payload: fragment,
    }),
  }

  const msgSwapRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgSwapRule,
    transform: (fragment, matched) => ({
      msgType: "terra/swap",
      canonicalMsg: [`Swapped ${matched[0].value} for ${matched[3].value}`],
      payload: fragment,
    }),
  }

  const msgExchangeRateVoteRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgExchangeRateVoteRule,
    transform: (fragment, matched) => ({
      msgType: "terra/exchange-rate-vote",
      canonicalMsg: [`Voted ${matched[2].value} for ${matched[0].value}`],
      payload: fragment,
    }),
  }

  const msgExchangeRatePrevoteRuleRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgExchangeRatePrevoteRule,
    transform: (fragment, matched) => ({
      msgType: "terra/exchange-rate-prevote",
      canonicalMsg: [`Prevoted for ${matched[0].value}`],
      payload: fragment,
    }),
  }

  const msgAggregateExchangeRateVoteRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgAggregateExchangeRateVoteRule,
    transform: (fragment, matched) => ({
      msgType: "terra/aggregate-exchange-rate-vote",
      canonicalMsg: [`Voted ${matched[1].value}`],
      payload: fragment,
    }),
  }

  const msgAggregateExchangeRatePrevoteRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgAggregateExchangeRatePrevoteRule,
    transform: (fragment) => ({
      msgType: "terra/aggregate-exchange-rate-prevote",
      canonicalMsg: [`Prevoted for all`],
      payload: fragment,
    }),
  }

  const msgUnjailRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgUnjailRule,
    transform: (fragment, matched) => ({
      msgType: "terra/unjail",
      canonicalMsg: [`Unjailed ${matched[2].value}`],
      payload: fragment,
    }),
  }

  const msgUndelegateRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgUndelegateRule,
    transform: (fragment, matched) => ({
      msgType: "terra/undelegate",
      canonicalMsg: [
        `Undelegated ${attachDenom(matched[1].value)} from ${matched[0].value}`,
      ],
      payload: fragment,
    }),
  }

  const msgEditValidatorRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgEditValidatorRule,
    transform: (fragment, matched) => ({
      msgType: "terra/edit-validator",
      canonicalMsg: [`Edit ${matched[2].value}`],
      payload: fragment,
    }),
  }

  const msgDelegateRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgDelegateRule,
    transform: (fragment, matched) => ({
      msgType: "terra/delegate",
      canonicalMsg: [
        `Delegated ${attachDenom(matched[1].value)} to ${matched[0].value}`,
      ],
      payload: fragment,
    }),
  }

  const msgCreateValidatorRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgCreateValidatorRule,
    transform: (fragment, matched) => ({
      msgType: "terra/create-validator",
      canonicalMsg: [`Created ${matched[0].value}`],
      payload: fragment,
    }),
  }

  const msgBeginRedelegateRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgBeginRedelegateRule,
    transform: (fragment, matched) => ({
      msgType: "terra/begin-redelegate",
      canonicalMsg: [
        `Redelegated ${attachDenom(matched[2].value)} from ${matched[0].value} to ${matched[1].value}`,
      ],
      payload: fragment,
    }),
  }

  const msgStoreCodeRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgStoreCodeRule,
    transform: (fragment, matched) => ({
      msgType: "terra/store-code",
      canonicalMsg: [`Stored ${matched[1].value}`],
      payload: fragment,
    }),
  }

  const msgMigrateContractRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgMigrateContractRule,
    transform: (fragment, matched) => ({
      msgType: "terra/migrate-contract",
      canonicalMsg: [`Migrated ${matched[1].value} to code ${matched[0].value}`],
      payload: fragment,
    }),
  }

  const msgInstantiateContractRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgInstantiateContractRule,
    transform: (fragment, matched) => ({
      msgType: "terra/instantiate-contract",
      canonicalMsg: [
        `Instantiated ${matched[2].value} from code ${matched[1].value}`,
      ],
      payload: fragment,
    }),
  }

  const msgTerraSwapRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgTerraSwapRule,
    transform: (fragment, matched) => ({
      msgType: "terra/swap",
      canonicalMsg: [
        `Swapped ${matched[2].value}${matched[0].value} for ${matched[3].value}${matched[1].value}`,
      ],
      payload: fragment,
    }),
  }

  const wasmTerraSwapRuleSet: LogFindersActionRuleSet = {
    rule: rules.wasmTerraSwapRule,
    transform: (fragment, matched) => ({
      msgType: "terra/swap",
      canonicalMsg: [
        `Swapped ${matched[2].value}${matched[0].value} for ${matched[3].value}${matched[1].value}`,
      ],
      payload: fragment,
    }),
  }

  const msgMultiSendRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgMultiSendRule,
    transform: (fragment, matched) => ({
      msgType: "terra/multi-send",
      canonicalMsg: [`Sent ${matched[1].value} to ${matched[0].value}`],
      payload: fragment,
    }),
  }

  const msgGrantAuthorizationRuleSet: LogFindersActionRuleSet = {
    rule: rules.msgGrantAuthorization,
    transform: (fragment, matched) => ({
      msgType: "terra/grant-authorization",
      canonicalMsg: [
        `Authorization for ${matched[0].value} granted to ${matched[2].value}`,
      ],
      payload: fragment,
    }),
  }

  return [
    msgSendRuleSet,
    msgWithdrawDelegationRewardRuleSet,
    msgVoteRuleSet,
    msgSubmitProposalRuleSet,
    msgDepositRuleSet,
    msgSwapRuleSet,
    msgExchangeRateVoteRuleSet,
    msgExchangeRatePrevoteRuleRuleSet,
    msgAggregateExchangeRateVoteRuleSet,
    msgAggregateExchangeRatePrevoteRuleSet,
    msgUnjailRuleSet,
    msgUndelegateRuleSet,
    msgEditValidatorRuleSet,
    msgDelegateRuleSet,
    msgCreateValidatorRuleSet,
    msgBeginRedelegateRuleSet,
    msgStoreCodeRuleSet,
    msgMigrateContractRuleSet,
    msgInstantiateContractRuleSet,
    msgTerraSwapRuleSet,
    msgMultiSendRuleSet,
    msgGrantAuthorizationRuleSet,
    wasmTerraSwapRuleSet,
  ]
}
export default create
