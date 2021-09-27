import { ReturningLogFinderResult } from "@terra-money/log-finder"
import { TxInfo } from "@terra-money/terra.js"
import isBase64 from "is-base64"
import { Action, Amount, LogFinderActionResult } from "./types"

const decodeBase64 = (str: string) => {
  try {
    return Buffer.from(str, "base64").toString()
  } catch {
    return str
  }
}

const isBase64Extended = (value: string) =>
  // we are only interested in json-alike base64's, which generally start with "ey" ('{')
  value.startsWith("ey") &&
  // other checks
  isBase64(value)

const reviver = (_: string, value: any) =>
  typeof value === "string" && isBase64Extended(value)
    ? JSON.parse(decodeBase64(value), reviver)
    : value

const decodeExecuteMsg = (str: string | object) => {
  if (typeof str === "string" && isBase64Extended(str)) {
    const decoded = decodeBase64(str)
    try {
      return JSON.stringify(JSON.parse(decoded, reviver), null, 2)
    } catch {
      return decoded
    }
  }
  return JSON.stringify(str, undefined, 2)
}

export const defaultAction = (tx: TxInfo.Data) => {
  const msgs = tx.tx.value.msg

  const action: LogFinderActionResult[] = []
  const fragment = {
    type: "Unknown",
    attributes: [],
  }

  const result: LogFinderActionResult = {
    fragment,
    match: [],
  }

  msgs.forEach((msg) => {
    if (msg.type === "wasm/MsgExecuteContract") {
      const contract = msg.value.contract
      const executeMsg = msg.value.execute_msg

      // successful wasm decode
      try {
        const decodeMsg = JSON.parse(decodeExecuteMsg(executeMsg))
        const key = Object.keys(decodeMsg)[0]
        const transformed: Action = {
          msgType: "wasm/execute",
          canonicalMsg: [`Execute ${key || "default"} on ${contract}`],
          payload: fragment,
        }

        action.push({ ...result, transformed })
      } catch (e) {
        // comes here, then it's unknown
        action.push({
          ...result,
          transformed: {
            msgType: "wasm/execute",
            canonicalMsg: [`Execute default on ${contract}`],
            payload: fragment,
          },
        })
      }
    } else {
      const msgTyps = msg.type.split("/")
      const transformed: Action = {
        msgType: `terra/${msgTyps[0] || "terra"}`,
        canonicalMsg: [msgTyps[1] || "Unknown tx"],
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

export const attachDenom = (string: string) =>
  string.includes("uluna") ? `${string}` : `${string}uluna`
