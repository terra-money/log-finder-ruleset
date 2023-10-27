import { ReturningLogFinderResult } from "@terra-money/log-finder"
import { collector } from "./collector"
import { defaultMsgAction, defaultMsgsAction, formatLogs } from "./utility"
import {
  LogFinderActionResult,
  LogFinderAmountResult,
  Amount,
  Action,
  Transaction,
  TxEvent,
  TxLog,
  Message,
} from "./types"

export const getTxCanonicalMsgs = (
  txInfo: Transaction,
  logMatcher: (events: TxEvent[]) => ReturningLogFinderResult<Action>[][],
  addresses?: Record<string, string>
): LogFinderActionResult[][] => {
  try {
    const matched: LogFinderActionResult[][] | undefined = txInfo?.logs?.map(
      (log: TxLog, index: number) => {
        const matchLog = logMatcher(log.events)

        if (matchLog.flat().length === 0) {
          const msg = txInfo.tx.body.messages[index]
          matchLog[index] = [defaultMsgAction(msg)]
        }

        const matchedPerLog: LogFinderActionResult[] = matchLog
          ?.flat()
          .filter(Boolean)
          .map((data) => {
            return { ...data, timestamp: txInfo.timestamp }
          })

        return matchedPerLog
      }
    )

    const logMatched = matched?.map((match) => collector(match, addresses))

    if (logMatched === undefined || logMatched?.length === 0) {
      // not matched rulesets or transaction failed or log is null (old network)
      const defaultCanonicalMsg = defaultMsgsAction(txInfo)

      const msg = txInfo.tx.body.messages
      // defaultMsgsAction array length is same msg length
      return msg.map((_: Message, index: number) => [
        defaultCanonicalMsg[index],
      ])
    }

    return logMatched
  } catch (e) {
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
  txInfo: Transaction,
  logMatcher: (events: TxEvent[]) => ReturningLogFinderResult<Amount>[][],
  address: string
): LogFinderAmountResult[][] | undefined => {
  try {
    if (txInfo.logs) {
      const msgTypes = txInfo.tx.body.messages
      const { timestamp, txhash } = txInfo

      const matched: LogFinderAmountResult[][] = txInfo.logs.map(
        (log: TxLog, index: number) => {
          const matchLog = logMatcher(log.events)
          const matchedPerLog: LogFinderAmountResult[] = matchLog
            ?.flat()
            .filter(Boolean)
            .map((data) => {
              const msgType = msgTypes[index]["@type"].split("/")[1]
              return formatLogs(data, msgType, address, timestamp, txhash)
            })

          return matchedPerLog
        }
      )

      return matched.flat().length > 0 ? matched : undefined
    }
  } catch (e) {
    return undefined
  }
}
