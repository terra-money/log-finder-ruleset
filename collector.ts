import { TxInfo } from "@terra-money/terra.js"
import { Action, LogFinderActionResult } from "./types"
import { decodeBase64 } from "./utility"

export const collector = (result: LogFinderActionResult[], tx: TxInfo.Data) => {
  const returnArray: LogFinderActionResult[] = []
  result.forEach((value) => {
    if (value.transformed) {
      const action = value.transformed.msgType?.split("/")[1]
      const types = [
        "transfer",
        "send",
        "delegate",
        "undelegate",
        "begin-redelegate",
      ]

      if (!types.includes(action)) {
        returnArray.push(value)
      }
    }
  })

  return returnArray.length > 0 ? returnArray : result
}

export const defaultAction = (tx: TxInfo.Data) => {
  try {
    const msgs = tx.tx.value.msg

    const action: LogFinderActionResult[] = []
    msgs.forEach((msg) => {
      if (msg.type === "wasm/MsgExecuteContract") {
        const contract = msg.value.contract
        const executeMsg = JSON.stringify(msg.value.execute_msg)
        const decodeMsg = JSON.parse(decodeBase64(executeMsg))
        const key = Object.keys(decodeMsg)[0]

        const fragment = {
          type: "Execute",
          attributes: [],
        }
        const transformed: Action = {
          msgType: "cw20/execute",
          canonicalMsg: [`Execute ${key} on ${contract}`],
          payload: fragment,
        }

        const result: LogFinderActionResult = {
          timestamp: tx.timestamp,
          fragment,
          match: [],
          transformed,
        }
        action.push(result)
      }
    })
    return action.length > 0 ? action : undefined
  } catch {
    return undefined
  }
}
