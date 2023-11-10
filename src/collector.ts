import { LogFinderActionResult } from "./types"

export const collector = (result: LogFinderActionResult[] | undefined, addresses?: Record<string, string>) => {
  const returnArray: LogFinderActionResult[] = []

  if (result) {
    result.forEach((value) => {
      if (value.transformed) {
        const action = value.transformed.msgType?.split("/")[1]
        const types = [
          "transfer",
          "send",
          "delegate",
          "undelegate",
          "begin-redelegate",
          "withdraw-delegation-reward"
        ]

        if (!types.includes(action)) {
          returnArray.push(value)
        }
      }
    })
  }

  if (returnArray.length <= 0 && result) {
    // Check if any address belongs to user and replace address with chainID string.
    for (const res of result) {
      if (res.fragment.type === 'transfer' && addresses) {
        for (const [ind, match] of Object.entries(res.match)) {
          if(['recipient', 'sender'].includes(match.key)) {
            const chainID = Object.keys(addresses).find(key => addresses[key] === match.value)
            if (chainID) {
              match.value = `wallet:${chainID}`
            }
          }
          // Remove txs where the Distribution Module is the sender.
          // These txs normally accompany an action tx and effectively duplicate history messages.
          if (match.key === 'sender' && match.value === "terra1jv65s3grqf6v6jl3dp4t6c9t9rk99cd8pm7utl") {
            result?.splice(result.indexOf(res), 1)
          }
        }
      }
    }
    return result
  } else {
    return returnArray
  }
}
