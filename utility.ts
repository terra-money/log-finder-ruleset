import { ReturningLogFinderResult } from "@terra-money/log-finder"
import { TxInfo } from "@terra-money/terra.js"
import { Action, Amount, LogFinderActionResult } from "./types"

const decodeBase64 = (str: string) => {
  try {
    return Buffer.from(str, "base64").toString()
  } catch {
    return str
  }
}

export const defaultAction = (tx: TxInfo.Data) => {
  const msgs = tx.tx.value.msg

  const action: LogFinderActionResult[] = []
  msgs.forEach((msg) => {
    const fragment = {
      type: "Unknown",
      attributes: [],
    }

    const result: LogFinderActionResult = {
      timestamp: tx.timestamp,
      fragment,
      match: [],
    }

    if (msg.type === "wasm/MsgExecuteContract") {
      const contract = msg.value.contract
      const executeMsg = JSON.stringify(msg.value.execute_msg)
      const decodeMsg = JSON.parse(decodeBase64(executeMsg))
      const key = Object.keys(decodeMsg)[0]
      const transformed: Action = {
        msgType: "cw20/execute",
        canonicalMsg: [`Execute ${key} on ${contract}`],
        payload: fragment,
      }

      action.push({ ...result, transformed })
    } else {
      const canonicalMsg = msg.type.split("/")[1]
      const transformed: Action = {
        msgType: "terra/core",
        canonicalMsg: [canonicalMsg],
        payload: fragment,
      }

      action.push({ ...result, transformed })
    }
  })

  return action
}

export const formatLogs = (
  data: ReturningLogFinderResult<Amount>,
  msgType: string,
  address: string,
  timestamp: string,
  txhash: string
) => {
  if (data.transformed) {
    const { transformed } = data
    const { type, withdraw_date } = transformed
    const logData = {
      ...data,
      timestamp: timestamp,
      txhash: txhash,
    }
    if (type === "delegate" && msgType === "MsgDelegate") {
      return {
        ...logData,
        transformed: { ...transformed, sender: address },
      }
    } else if (
      type === "unDelegate" &&
      msgType === "MsgUndelegate" &&
      withdraw_date
    ) {
      const now = new Date()
      const withdrawDate = new Date(withdraw_date)
      return {
        ...logData,
        transformed: {
          ...transformed,
          recipient: now > withdrawDate ? address : "",
        },
      }
    }
  }

  return { ...data, timestamp: timestamp, txhash: txhash }
}
