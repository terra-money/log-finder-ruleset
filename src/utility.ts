import { ReturningLogFinderResult } from "@terra-money/log-finder"
import {
  Action,
  Amount,
  LogFinderActionResult,
  Message,
  Transaction,
} from "./types"

const decodeBase64 = (str: string) => {
  try {
    return Buffer.from(str, "base64").toString()
  } catch {
    return str
  }
}

const BASE64_REGEX =
  /^([A-Za-z0-9+/]{4})*([A-Za-z0-9+/]{3}=|[A-Za-z0-9+/]{2}==)?$/

const isBase64 = (value: string) => BASE64_REGEX.test(value)

const isBase64Extended = (value: string) =>
  // we are only interested in json-alike base64's, which generally start with "ey" ('{')
  value.startsWith("ey") &&
  // other checks
  isBase64(value)

const reviver = (_: string, value: any) =>
  typeof value === "string" && isBase64Extended(value)
    ? JSON.parse(decodeBase64(value), reviver)
    : value

export const defaultMsgsAction = (tx: Transaction) => {
  const msgs = tx.tx.body.messages
  const action: LogFinderActionResult[] = []

  msgs.forEach((msg: Message) => {
    action.push(defaultMsgAction(msg))
  })

  return action
}

export const defaultMsgAction = (msg: Message) => {
  const fragment = {
    type: "Unknown",
    attributes: [],
  }

  const result: LogFinderActionResult = {
    fragment,
    match: [],
  }

  if (msg["@type"].includes("MsgExecuteContract")) {
    const contract = msg?.contract
    const executeMsg = msg?.execute_msg || msg?.msg

    // successful wasm decode
    try {
      const key = Object.keys(executeMsg)[0]
      const transformed: Action = {
        msgType: "wasm/execute",
        canonicalMsg: [`Execute ${key || "default"} on ${contract}`],
        payload: fragment,
      }

      return { ...result, transformed }
    } catch (e) {
      // comes here, then it's unknown
      return {
        ...result,
        transformed: {
          msgType: "wasm/execute",
          canonicalMsg: [`Execute default on ${contract}`],
          payload: fragment,
        },
      }
    }
  } else {
    const type = msg?.["@type"]
    const msgType = type?.split("Msg")
    const transformed: Action = {
      msgType: `terra/${msgType?.[0] || "terra"}`,
      canonicalMsg: ["Msg" + msgType?.[msgType?.length - 1] || "Unknown tx"],
      payload: fragment,
    }

    return { ...result, transformed }
  }
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
