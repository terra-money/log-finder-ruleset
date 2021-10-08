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

// https://lcd.terra.dev/txs/:txhash
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
const logMatcher = createLogMatcherForActions(actionRuleset)
const matchedMsg = getTxCanonicalMsgs(JSON.stringify(tx), logMatcher)

console.log(matchedMsg)


// getTxAmountInfo
const amountRuleset = createAmountRuleSet(network)
const logMatcher = createLogMatcherForAmounts(amountRuleset)
const matchedMsg = getTxAmounts(JSON.stringify(tx), logMatcher, address)

console.log(matchedMsg)

```
