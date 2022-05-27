import { TxInfo, Event } from "@terra-money/terra.js"
import { ReturningLogFinderResult } from "@terra-money/log-finder"
import { collector } from "./collector"
import {
  LogFinderActionResult,
  LogFinderAmountResult,
  Amount,
  Action,
} from "./types"
import { defaultMsgAction, defaultMsgsAction, formatLogs } from "./utility"

export const getTxCanonicalMsgs = (
  data: string,
  logMatcher: (events: Event[]) => ReturningLogFinderResult<Action>[][]
): LogFinderActionResult[][] => {
  try {
    const tx: TxInfo.Data = JSON.parse(data)

    const matched: LogFinderActionResult[][] | undefined = tx?.logs?.map(
      (log) => {
        const matchLog = logMatcher(log.events)
        const matchedPerLog: LogFinderActionResult[] = matchLog
          ?.flat()
          .filter(Boolean)
          .map((data) => ({ ...data, timestamp: tx.timestamp }))
        return matchedPerLog
      }
    )

    const logMatched = matched?.map((match) => collector(match))

    if (
      logMatched === undefined ||
      (logMatched && logMatched.flat().length <= 0)
    ) {
      // not matched rulesets or transaction failed or log is null (old network)
      const defaultCanonicalMsg = defaultMsgsAction(tx)
      return [defaultCanonicalMsg]
    }

    return logMatched
  } catch {
    const fragment = {
      type: "Unknown",
      attributes: [],
    }
    const transformed: Action = {
      msgType: "unknown/terra",
      canonicalMsg: ["Unknown tx"],
      payload: fragment,
    }

    return [[{ fragment, match: [], transformed }]]
  }
}

//return array [logNumber][matched logNumber]
export const getTxAllCanonicalMsgs = (
  data: string,
  logMatcher: (events: Event[]) => ReturningLogFinderResult<Action>[][]
): LogFinderActionResult[][] => {
  try {
    const tx: TxInfo.Data = JSON.parse(data)

    const matched: LogFinderActionResult[][] | undefined = tx?.logs?.map(
      (log, index) => {
        const matchLog = logMatcher(log.events)

        if (matchLog.flat().length === 0) {
          const msg = tx.tx.value.msg[index]
          matchLog[index] = [defaultMsgAction(msg)]
        }

        const matchedPerLog: LogFinderActionResult[] = matchLog
          ?.flat()
          .filter(Boolean)
          .map((data) => {
            return { ...data, timestamp: tx.timestamp }
          })
        return matchedPerLog
      }
    )

    const logMatched = matched?.map((match) => collector(match))

    if (logMatched === undefined || logMatched?.length === 0) {
      // not matched rulesets or transaction failed or log is null (old network)
      const defaultCanonicalMsg = defaultMsgsAction(tx)

      const msg = tx.tx.value.msg
      // defaultMsgsAction array length is same msg length
      return msg.map((_, index) => [defaultCanonicalMsg[index]])
    }

    return logMatched
  } catch {
    const fragment = {
      type: "Unknown",
      attributes: [],
    }
    const transformed: Action = {
      msgType: "unknown/terra",
      canonicalMsg: ["Unknown tx"],
      payload: fragment,
    }

    return [[{ fragment, match: [], transformed }]]
  }
}

export const getTxAmounts = (
  data: string,
  logMatcher: (events: Event[]) => ReturningLogFinderResult<Amount>[][],
  address: string
): LogFinderAmountResult[][] | undefined => {
  try {
    const tx: TxInfo.Data = JSON.parse(data)
    if (tx.logs) {
      const msgTypes = tx.tx.value.msg
      const { timestamp, txhash } = tx

      const matched: LogFinderAmountResult[][] = tx.logs.map((log, index) => {
        const matchLog = logMatcher(log.events)
        const matchedPerLog: LogFinderAmountResult[] = matchLog
          ?.flat()
          .filter(Boolean)
          .map((data) => {
            const msgType = msgTypes[index].type.split("/")[1]
            return formatLogs(data, msgType, address, timestamp, txhash)
          })

        return matchedPerLog
      })

      return matched.flat().length > 0 ? matched : undefined
    }
  } catch {
    return undefined
  }
}
