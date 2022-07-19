# @terra-money/log-finder-ruleset

Terra standard ruleset for well known log patterns

## Example codes

```typescript
import {
  createActionRuleSet,
  createAmountRuleSet
  createLogMatcherForActions,
  createLogMatcherForAmounts,
  getTxCanonicalMsgs,
  getTxAmounts
} from "@terra-money/log-finder-ruleset"

// https://phoenix-lcd.terra.dev/cosmos/tx/v1beta1/txs/:txhash
const tx = {
  "height": ...,
  "txhash": ...,
  "raw_log": ...,
  "logs": ...,
  "gas_wanted": ...,
  "gas_used": ...,
  "tx": ...,
  "timestamp": ...,
}
const address = "terra1..."
const network = "mainnet"

// getTxCanonicalMsgs
const actionRuleset = createActionRuleSet(network)
const actionLogMatcher = createLogMatcherForActions(actionRuleset)
const actionMatchedMsg = getTxCanonicalMsgs(tx, actionLogMatcher)

console.log(actionMatchedMsg)


// getTxAmountInfo
const amountRuleset = createAmountRuleSet(network)
const amountLogMatcher = createLogMatcherForAmounts(amountRuleset)
const amountMatchedMsg = getTxAmounts(tx, amountLogMatcher, address)

console.log(amountMatchedMsg)

```
